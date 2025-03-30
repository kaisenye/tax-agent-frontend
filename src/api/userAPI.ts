import httpClient from './httpClient';

/**
 * Validates a user ID by checking if it exists in the backend
 * @param userId The user ID to validate
 * @returns A promise that resolves to the user data if found, or null if not found
 */
export const validateUser = async (userId: string): Promise<any> => {
  try {
    const response = await httpClient.get(`/api/users/profile`, {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null; // User not found
    }
    throw error; // Re-throw other errors
  }
};

/**
 * Fetches the user profile data
 * @param userId The user ID to fetch profile for
 * @returns A promise that resolves to the user profile data
 */
export const getUserProfile = async (userId: string): Promise<any> => {
  return validateUser(userId);
}; 