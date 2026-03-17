import bcrypt from 'bcrypt'
import { User } from '../../models/user.schema'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' })
  }

  const user = await User.findOne({ email })

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
