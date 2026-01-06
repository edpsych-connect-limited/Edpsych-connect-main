import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { SimpleChallenge, GamificationResponse, PointsResponse, LeaderboardEntry } from "@/lib/gamificationImpl";

export const RealGamification = {
  getUserChallenges: async (userId: string): Promise<SimpleChallenge[]> => {
    try {
      // Get all active challenges
      const challenges = await prisma.challenge.findMany({
        where: { isActive: true }
      });

      // Get user progress
      const progress = await prisma.challengeProgress.findMany({
        where: { userId: userId }
      });

      // Map to SimpleChallenge
      return challenges.map(c => {
        const userProgress = progress.find(p => p.challengeId === c.id);
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          points: c.xpReward,
          difficulty: c.difficulty,
          category: c.type,
          completedAt: userProgress?.completedAt?.toISOString(),
          isCompleted: userProgress?.isCompleted || false
        };
      });
    } catch (error) {
      logger.error("Error fetching user challenges", error);
      return [];
    }
  },

  completeChallenge: async (userId: string, challengeId: string): Promise<GamificationResponse> => {
    try {
      const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId }
      });

      if (!challenge) {
        return { success: false, message: "Challenge not found" };
      }

      await prisma.challengeProgress.upsert({
        where: {
          challengeId_userId: {
            challengeId,
            userId
          }
        },
        update: {
          isCompleted: true,
          completedAt: new Date(),
          progress: 100,
          xpEarned: challenge.xpReward,
          meritEarned: challenge.meritReward
        },
        create: {
          challengeId,
          userId,
          isCompleted: true,
          completedAt: new Date(),
          progress: 100,
          target: 100,
          xpEarned: challenge.xpReward,
          meritEarned: challenge.meritReward
        }
      });

      // Also award points to gamification_scores
      await prisma.gamification_scores.create({
        data: {
          user_id: parseInt(userId), // Assuming userId is convertible to int for this table
          score_type: 'challenge_completion',
          score_value: challenge.xpReward,
          metadata: { challengeId, title: challenge.title }
        }
      });

      return { success: true };
    } catch (error) {
      logger.error("Error completing challenge", error);
      return { success: false, message: "Failed to complete challenge" };
    }
  },

  getUserPoints: async (userId: string): Promise<PointsResponse> => {
    try {
      const result = await prisma.gamification_scores.aggregate({
        where: { user_id: parseInt(userId) },
        _sum: { score_value: true }
      });
      return { points: result._sum.score_value || 0 };
    } catch (error) {
      logger.error("Error fetching user points", error);
      return { points: 0 };
    }
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    try {
      // This is a simplified leaderboard query
      // In a real scenario, we might want to join with users table
      const scores = await prisma.gamification_scores.groupBy({
        by: ['user_id'],
        _sum: { score_value: true },
        orderBy: {
          _sum: {
            score_value: 'desc'
          }
        },
        take: 10
      });

      // Fetch user details
      const userIds = scores.map(s => s.user_id);
      const users = await prisma.users.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true }
      });

      return scores.map((s, index) => {
        const user = users.find(u => u.id === s.user_id);
        return {
          id: s.user_id.toString(),
          username: user?.name || 'Unknown User',
          points: s._sum.score_value || 0,
          rank: index + 1
        };
      });
    } catch (error) {
      logger.error("Error fetching leaderboard", error);
      return [];
    }
  }
};
