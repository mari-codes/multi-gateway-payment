import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Gateway from '#models/gateway'

export default class extends BaseSeeder {
  async run() {
    await Gateway.updateOrCreateMany('name', [
      { name: 'gateway_1', isActive: true, priority: 1 },
      { name: 'gateway_2', isActive: true, priority: 2 },
    ])
  }
}
