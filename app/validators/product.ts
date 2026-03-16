import vine from '@vinejs/vine'

export const createProductValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(150),
  amount: vine.number().positive().withoutDecimals(),
})

export const updateProductValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(150).optional(),
  amount: vine.number().positive().withoutDecimals().optional(),
})
