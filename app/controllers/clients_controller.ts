import Client from '#models/client'
import Transaction from '#models/transaction'
import type { HttpContext } from '@adonisjs/core/http'

export default class ClientsController {
  async index() {
    return Client.query().orderBy('id', 'desc')
  }

  async show({ params, response }: HttpContext) {
    const client = await Client.find(params.id)
    if (!client) {
      return response.notFound({ message: 'Client not found' })
    }

    const transactions = await Transaction.query()
      .where('clientId', client.id)
      .orderBy('id', 'desc')

    return { client, transactions }
  }
}
