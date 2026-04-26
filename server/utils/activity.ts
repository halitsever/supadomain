import { Activity, type ActivityKind } from '../models/activity.schema'
import logger from '../logger'

export async function logActivity(domainUrl: string, kind: ActivityKind, message: string) {
    try {
        await Activity.create({ domainUrl, kind, message, createdAt: new Date() })
    } catch (error) {
        logger.error('Failed to log activity:', error)
    }
}
