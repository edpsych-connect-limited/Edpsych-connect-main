/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

import { RewardsService } from '@/lib/tokenisation/rewardsService';
import { TreasuryService } from '@/lib/tokenisation/treasuryService';

const treasuryService = new TreasuryService();
const rewardsService = new RewardsService(treasuryService);

export { treasuryService, rewardsService };
