import Gateway from '#models/gateway'
import { updateGatewayPriorityValidator, updateGatewayStatusValidator } from '#validators/gateway'
import type { HttpContext } from '@adonisjs/core/http'

export default class GatewaysController {
  async index() {
    return Gateway.query().orderBy('priority', 'asc')
  }

  async updateStatus({ params, request, response }: HttpContext) {
    const gateway = await Gateway.find(params.id)
    if (!gateway) {
      return response.notFound({ message: 'Gateway not found' })
    }
    const payload = await request.validateUsing(updateGatewayStatusValidator)
    gateway.isActive = payload.isActive
    await gateway.save()
    return gateway
  }

  async updatePriority({ params, request, response }: HttpContext) {
    const gateway = await Gateway.find(params.id)
    if (!gateway) {
      return response.notFound({ message: 'Gateway not found' })
    }
    const payload = await request.validateUsing(updateGatewayPriorityValidator)
    gateway.priority = payload.priority
    await gateway.save()
    return gateway
  }
}
