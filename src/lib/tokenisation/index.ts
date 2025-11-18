import { RewardsService } from '@/lib/tokenisation/rewardsService';
import { TreasuryService } from '@/lib/tokenisation/treasuryService';

const treasuryService = new TreasuryService();
const rewardsService = new RewardsService(treasuryService);

export { treasuryService, rewardsService };
