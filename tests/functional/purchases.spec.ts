import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import nock from 'nock'
import Gateway from '#models/gateway'
import Product from '#models/product'
import type { AceService } from '@adonisjs/core/types'

const runAce = async (commandName: string, args: string[] = []) => {
  const ace = (await app.container.make('ace')) as AceService
  const command = await ace.exec(commandName, args)
  if (command.exitCode) {
    if (command.error) {
      throw command.error
    }
    throw new Error(`"${commandName}" failed`)
  }
}

test.group('Purchases', (group) => {
  let rollback: (() => Promise<void>) | null = null

  group.setup(async () => {
    await runAce('migration:run', ['--compact-output', '--no-schema-generate'])
    rollback = () => runAce('migration:reset', ['--compact-output', '--no-schema-generate'])
  })

  group.teardown(async () => {
    if (rollback) {
      await rollback()
    }
  })

  group.each.setup(async () => {
    await Gateway.updateOrCreateMany('name', [
      { name: 'gateway_1', isActive: true, priority: 1 },
      { name: 'gateway_2', isActive: true, priority: 2 },
    ])

    await Product.create({ name: 'Plan A', amount: 1000 })
  })

  test('charges with gateway 1', async ({ client, assert }) => {
    nock('http://localhost:3001').post('/login').reply(200, { token: 'token-1' })
    nock('http://localhost:3001').post('/transactions').reply(200, { id: 'tx-1' })

    const response = await client.post('/api/v1/purchases').json({
      productId: 1,
      quantity: 2,
      clientName: 'Tester',
      clientEmail: 'tester@email.com',
      cardNumber: '5569000000006063',
      cvv: '010',
    })

    response.assertStatus(200)
    assert.equal(response.body().transaction.status, 'paid')
    assert.equal(response.body().transaction.amount, 2000)
  })

  test('falls back to gateway 2 when gateway 1 fails', async ({ client, assert }) => {
    nock('http://localhost:3001').post('/login').reply(200, { token: 'token-1' })
    nock('http://localhost:3001').post('/transactions').reply(400, { error: 'invalid card' })
    nock('http://localhost:3002').post('/transacoes').reply(200, { id: 'tx-2' })

    const response = await client.post('/api/v1/purchases').json({
      productId: 1,
      quantity: 1,
      clientName: 'Tester',
      clientEmail: 'tester@email.com',
      cardNumber: '5569000000006063',
      cvv: '010',
    })

    response.assertStatus(200)
    assert.equal(response.body().transaction.status, 'paid')
  })
})
