import vine from '@vinejs/vine'

export const updateGatewayStatusValidator = vine.create({
  isActive: vine.boolean(),
})

export const updateGatewayPriorityValidator = vine.create({
  priority: vine.number().positive().withoutDecimals(),
})
