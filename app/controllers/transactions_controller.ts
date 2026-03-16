import Client from '#models/client'
import Gateway from '#models/gateway'
import Product from '#models/product'
import Transaction from '#models/transaction'
import { GatewayManager } from '#services/gateway_manager'
import type { HttpContext } from '@adonisjs/core/http'

export default class TransactionsController {
  private gatewayManager = new GatewayManager()

  async index() {
    return Transaction.query().orderBy('id', 'desc')
  }

  async show({ params, response }: HttpContext) {
    const transaction = await Transaction.find(params.id)
    if (!transaction) {
      return response.notFound({ message: 'Transaction not found' })
    }

    const client = await Client.find(transaction.clientId)
    const gateway = await Gateway.find(transaction.gatewayId)
    const product = await Product.find(transaction.productId)

    return { transaction, client, gateway, product }
  }

  async refund({ params, response }: HttpContext) {
    const transaction = await Transaction.find(params.id)
    if (!transaction) {
      return response.notFound({ message: 'Transaction not found' })
    }

    if (transaction.status !== 'paid') {
      return response.badRequest({ message: 'Only paid transactions can be refunded' })
    }

    const gateway = await Gateway.find(transaction.gatewayId)
    if (!gateway) {
      return response.notFound({ message: 'Gateway not found' })
    }

    if (!transaction.externalId) {
      return response.badRequest({ message: 'Transaction does not have an external id' })
    }

    await this.gatewayManager.refund(gateway.name, transaction.externalId)
    transaction.status = 'refunded'
    await transaction.save()

    return { message: 'Refund processed', transaction }
  }
}
