import httpClient from './httpClient';
import { Case, CreateCaseRequest } from '../types/case.types';

/**
 * Creates a new case
 * @param caseData The case data to create
 * @returns A promise that resolves to the created case
 */
export const createCase = async (caseData: CreateCaseRequest): Promise<Case> => {
  try {
    const response = await httpClient.post('/api/cases/create', caseData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating case:', error);
    throw error;
  }
};

/**
 * Gets all cases for a user
 * @param userId The user ID to get cases for
 * @returns A promise that resolves to an array of cases
 */
export const getUserCases = async (userId: string): Promise<Array<Case>> => {
  try {
    const response = await httpClient.get('/api/cases/list', {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error getting user cases:', error);
    throw error;
  }
};

/**
 * Gets details for a specific case
 * @param caseId The case ID to get details for
 * @returns A promise that resolves to the case details
 */
export const getCaseDetails = async (caseId: string): Promise<Case> => {
  try {
    const response = await httpClient.get('/api/cases/case', {
      params: { case_id: caseId }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error getting case details:', error);
    throw error;
  }
};

/**
 * Deletes a case
 * @param caseId The case ID to delete
 * @returns A promise that resolves to a boolean indicating success
 */
export const deleteCase = async (caseId: string): Promise<boolean> => {
  try {
    const response = await httpClient.delete('/api/cases/delete', {
      data: { case_id: caseId }
    });
    return true;
  } catch (error: any) {
    console.error('Error deleting case:', error);
    return false;
  }
}; 