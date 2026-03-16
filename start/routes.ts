import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessToken, 'store'])
        router.post('logout', [controllers.AccessToken, 'destroy']).use(middleware.auth())
      })
      .prefix('auth')
      .as('auth')

    router.post('purchases', [controllers.Purchases, 'store'])

    router
      .group(() => {
        router.get('/profile', [controllers.Profile, 'show'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('gateways', [controllers.Gateways, 'index'])
        router.patch('gateways/:id/status', [controllers.Gateways, 'updateStatus'])
        router.patch('gateways/:id/priority', [controllers.Gateways, 'updatePriority'])
      })
      .use([middleware.auth(), middleware.role(['ADMIN'])])

    router
      .group(() => {
        router.resource('users', controllers.Users).apiOnly()
      })
      .use([middleware.auth(), middleware.role(['ADMIN'])])

    router
      .group(() => {
        router.resource('products', controllers.Products).apiOnly()
      })
      .use([middleware.auth(), middleware.role(['ADMIN', 'MANAGER'])])

    router
      .group(() => {
        router.get('clients', [controllers.Clients, 'index'])
        router.get('clients/:id', [controllers.Clients, 'show'])
      })
      .use(middleware.auth())

    router
      .group(() => {
        router.get('transactions', [controllers.Transactions, 'index'])
        router.get('transactions/:id', [controllers.Transactions, 'show'])
      })
      .use(middleware.auth())

    router
      .group(() => {
        router.post('transactions/:id/refund', [controllers.Transactions, 'refund'])
      })
      .use([middleware.auth(), middleware.role(['ADMIN', 'FINANCE'])])
  })
  .prefix('/api/v1')
