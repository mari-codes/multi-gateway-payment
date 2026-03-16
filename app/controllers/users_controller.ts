import User from '#models/user'
import { adminCreateUserValidator, adminUpdateUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class UsersController {
  async index() {
    const users = await User.query().orderBy('id', 'desc')
    return users.map((user) => UserTransformer.transform(user))
  }

  async show({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }
    return UserTransformer.transform(user)
  }

  async store({ request }: HttpContext) {
    const payload = await request.validateUsing(adminCreateUserValidator)
    const user = await User.create(payload)
    return UserTransformer.transform(user)
  }

  async update({ params, request, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }
    const payload = await request.validateUsing(adminUpdateUserValidator)
    user.merge(payload)
    await user.save()
    return UserTransformer.transform(user)
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }
    await user.delete()
    return { message: 'User deleted' }
  }
}
