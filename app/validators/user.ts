import vine from '@vinejs/vine'

const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)
const role = () => vine.enum(['ADMIN', 'MANAGER', 'FINANCE', 'USER'])

export const signupValidator = vine.create({
  fullName: vine.string().nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

export const adminCreateUserValidator = vine.create({
  fullName: vine.string().nullable(),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  role: role(),
})

export const adminUpdateUserValidator = vine.create({
  fullName: vine.string().nullable().optional(),
  email: email().optional(),
  password: password().optional(),
  role: role().optional(),
})
