import bcrypt from 'bcrypt'
import { User } from '../models/user.schema'
import logger from '../logger';
import { randomBytes } from 'node:crypto';

export default defineNitroPlugin(async () => {
  const count = await User.countDocuments()

  if (count !== 0) return;

  const definedPassword = process.env.ADMIN_PASSWORD;


  const email = process.env.ADMIN_EMAIL || 'admin@supadomain.com'
  const password = definedPassword || randomBytes(32).toString('hex');

  const hashedPassword = await bcrypt.hash(password, 12)

  await User.create({ email, password: hashedPassword })
  logger.success(`[User Creation] Admin user created - Email: ${email} - Password: ${definedPassword ? "*".repeat(10) : password}`)

})
