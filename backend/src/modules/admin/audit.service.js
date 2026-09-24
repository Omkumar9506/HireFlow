import { AuditLog } from './auditLog.model.js';
import { logger } from '../../utils/logger.js';

export const auditService = {
  logAction: async ({ userId = null, action, entity, entityId = '', oldValue = null, newValue = null, req = null }) => {
    try {
      const ipAddress = req?.ip || req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '';
      const userAgent = req?.headers['user-agent'] || '';

      await AuditLog.create({
        userId,
        action,
        entity,
        entityId: String(entityId),
        oldValue,
        newValue,
        ipAddress,
        userAgent,
      });
    } catch (err) {
      logger.error('Failed to record audit log:', err.message);
    }
  },
};
