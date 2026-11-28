import bcrypt from 'bcrypt'
import { randomBytes } from 'node:crypto';
import { defineMongooseConnection } from '#nuxt/mongoose'
import { User } from '../models/user.schema'
import logger from '../logger';

async function seedAdminUser() {
  const count = await User.countDocuments()

  if (count !== 0) return;

  const definedPassword = process.env.ADMIN_PASSWORD;

  const email = process.env.ADMIN_EMAIL || 'admin@supadomain.com'
  const password = definedPassword || randomBytes(32).toString('hex');

  const hashedPassword = await bcrypt.hash(password, 12)

  await User.create({ email, password: hashedPassword })
  logger.success(`[User Creation] Admin user created - Email: ${email} - Password: ${definedPassword ? "*".repeat(10) : password}`)
}

export default defineNitroPlugin(async () => {
  // Read at startup, so a built server takes MONGODB_URI from its own environment.
  const uri = process.env.MONGODB_URI || process.env.NUXT_MONGOOSE_URI

  if (!uri) {
    logger.error('MONGODB_URI is not set. Supadomain cannot store anything without a MongoDB connection.')
    return
  }

  try {
    await defineMongooseConnection({ uri })
    await seedAdminUser()
  } catch (error) {
    logger.error('Database setup failed:', error)
  }
})
