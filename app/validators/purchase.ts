import vine from '@vinejs/vine'

export const purchaseValidator = vine.create({
  productId: vine.number().positive().withoutDecimals(),
  quantity: vine.number().positive().withoutDecimals(),
  clientName: vine.string().trim().minLength(2).maxLength(150),
  clientEmail: vine.string().email().maxLength(254),
  cardNumber: vine
    .string()
    .trim()
    .regex(/^\d{16}$/),
  cvv: vine
    .string()
    .trim()
    .regex(/^\d{3}$/),
})
