import Client from '#models/client'
import Product from '#models/product'
import Transaction from '#models/transaction'
import { GatewayChargeError, GatewayManager } from '#services/gateway_manager'
import { purchaseValidator } from '#validators/purchase'
import type { HttpContext } from '@adonisjs/core/http'

export default class PurchasesController {
  private gatewayManager = new GatewayManager()

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(purchaseValidator)

    const product = await Product.find(payload.productId)
    if (!product) {
      return response.notFound({ message: 'Product not found' })
    }

    const client = await Client.firstOrCreate(
      { email: payload.clientEmail },
      { name: payload.clientName, email: payload.clientEmail }
    )

    const amount = product.amount * payload.quantity
    const cardLastNumbers = payload.cardNumber.slice(-4)

    try {
      const { gateway, externalId } = await this.gatewayManager.charge({
        amount,
        name: client.name,
        email: client.email,
        cardNumber: payload.cardNumber,
        cvv: payload.cvv,
      })

      const transaction = await Transaction.create({
        clientId: client.id,
        gatewayId: gateway.id,
        externalId,
        status: 'paid',
        amount,
        cardLastNumbers,
        productId: product.id,
        quantity: payload.quantity,
      })

      return { transaction }
    } catch (error) {
      let gatewayId: number | null = null
      let message = 'Charge failed'

      if (error instanceof GatewayChargeError) {
        gatewayId = error.lastGateway?.id ?? null
        message = error.message
      }

      if (gatewayId) {
        await Transaction.create({
          clientId: client.id,
          gatewayId,
          externalId: null,
          status: 'failed',
          amount,
          cardLastNumbers,
          productId: product.id,
          quantity: payload.quantity,
        })
      }

      return response.badRequest({ message })
    }
  }
}
