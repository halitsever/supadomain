import bcrypt from 'bcrypt'
import { User } from '../../models/user.schema'

export default defineEventHandler(async (event) => {
  const { email, password } = (await readBody(event)) ?? {}

  // Rejecting non-strings keeps query operators such as { $ne: null } out of the lookup.
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' })
  }

  const user = await User.findOne({ email: email.trim() })

  if (!user) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  await setUserSession(event, {
    user: {
      id: user._id.toString(),
      email: user.email,
    }
  })

  return { success: true }
})
