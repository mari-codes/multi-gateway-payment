import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('gateways', (table) => {
      table.increments('id').notNullable()
      table.string('name', 100).notNullable().unique()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.integer('priority').unsigned().notNullable().defaultTo(1)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('clients', (table) => {
      table.increments('id').notNullable()
      table.string('name', 150).notNullable()
      table.string('email', 254).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('products', (table) => {
      table.increments('id').notNullable()
      table.string('name', 150).notNullable()
      table.integer('amount').unsigned().notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('transactions', (table) => {
      table.increments('id').notNullable()
      table
        .integer('client_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('clients')
        .onDelete('CASCADE')
      table
        .integer('gateway_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('gateways')
        .onDelete('RESTRICT')
      table.string('external_id', 150).nullable()
      table.string('status', 20).notNullable()
      table.integer('amount').unsigned().notNullable()
      table.string('card_last_numbers', 4).notNullable()
      table
        .integer('product_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('RESTRICT')
      table.integer('quantity').unsigned().notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable('transaction_products', (table) => {
      table.increments('id').notNullable()
      table
        .integer('transaction_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('transactions')
        .onDelete('CASCADE')
      table
        .integer('product_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('RESTRICT')
      table.integer('quantity').unsigned().notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable('transaction_products')
    this.schema.dropTable('transactions')
    this.schema.dropTable('products')
    this.schema.dropTable('clients')
    this.schema.dropTable('gateways')
  }
}
