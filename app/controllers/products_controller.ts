import Product from '#models/product'
import { createProductValidator, updateProductValidator } from '#validators/product'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProductsController {
  async index() {
    return Product.query().orderBy('id', 'desc')
  }

  async show({ params, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) {
      return response.notFound({ message: 'Product not found' })
    }
    return product
  }

  async store({ request }: HttpContext) {
    const payload = await request.validateUsing(createProductValidator)
    return Product.create(payload)
  }

  async update({ params, request, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) {
      return response.notFound({ message: 'Product not found' })
    }
    const payload = await request.validateUsing(updateProductValidator)
    product.merge(payload)
    await product.save()
    return product
  }

  async destroy({ params, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) {
      return response.notFound({ message: 'Product not found' })
    }
    await product.delete()
    return { message: 'Product deleted' }
  }
}
