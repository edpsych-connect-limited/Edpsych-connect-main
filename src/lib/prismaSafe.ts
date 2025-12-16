/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 *
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// Backwards-compatible alias for older code that imported the default Prisma client from this module.
// The canonical tenant-aware client is exported from `@/lib/prisma`.
import { prisma } from '@/lib/prisma';

export default prisma;
