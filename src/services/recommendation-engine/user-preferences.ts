import { CreateUserPreferenceInput, UpdateUserPreferenceInput } from "../../types/recommendation-engine-types";
import db from "./database-adapter";

/**
 * Service for managing user preferences for the recommendation engine
 */
export class UserPreferenceService {
  /**
   * Create a new user preference
   */
  async createPreference(data: CreateUserPreferenceInput) {
    return db.createUserPreference({
      id: data.id,
      categoryId: data.categoryId,
      tagId: data.tagId,
      contentType: data.contentType,
      weight: data.weight || 1.0
    });
  }

  /**
   * Get all preferences for a user
   */
  async getUserPreferences(id: string) {
    return db.getUserPreferences(id);
  }

  /**
   * Get preferences by category for a user
   */
  async getUserCategoryPreferences(id: string, categoryId: string) {
    const allPreferences = await db.getUserPreferences(id);
    return allPreferences.filter((pref: any) => pref.categoryId === categoryId);
  }

  /**
   * Get preferences by tag for a user
   */
  async getUserTagPreferences(id: string, tagId: string) {
    const allPreferences = await db.getUserPreferences(id);
    return allPreferences.filter((pref: any) => pref.tagId === tagId);
  }

  /**
   * Get preferences by content type for a user
   */
  async getUserContentTypePreferences(id: string, contentType: string) {
    const allPreferences = await db.getUserPreferences(id);
    return allPreferences.filter((pref: any) => pref.contentType === contentType);
  }

  /**
   * Update a user preference
   */
  async updatePreference(id: string, data: UpdateUserPreferenceInput) {
    return db.updateUserPreference(id, {
      categoryId: data.categoryId,
      tagId: data.tagId,
      contentType: data.contentType,
      weight: data.weight
    });
  }

  /**
   * Delete a user preference
   */
  async deletePreference(id: string) {
    return db.deleteUserPreference(id);
  }

  /**
   * Get user preference analytics
   */
  async getUserPreferenceAnalytics(_id: string) {
    // TODO: Implement proper schema for recommendation preferences
    // Current user_preferences table is for UI settings only
    return {
      categoryPreferences: [],
      typePreferences: [],
      total: 0,
    };
  }

  /**
   * Bulk update user preferences
   */
  async bulkUpdatePreferences(_preferences: UpdateUserPreferenceInput[]) {
    // TODO: Implement proper schema for recommendation preferences
    return [];
  }

  /**
   * Increment preference weight
   */
  async incrementPreferenceWeight(_id: string, _incrementBy: number = 0.1) {
    // TODO: Implement proper schema for recommendation preferences
    return null;
  }
}

export default new UserPreferenceService();