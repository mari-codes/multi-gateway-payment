import type { HttpContext } from '@adonisjs/core/http'

export default class RoleMiddleware {
  async handle({ auth, response }: HttpContext, next: () => Promise<void>, roles: string[]) {
    const user = await auth.getUserOrFail()
    if (!roles.includes(user.role)) {
      return response.forbidden({ message: 'User does not have permission.' })
    }

    await next()
  }
}
