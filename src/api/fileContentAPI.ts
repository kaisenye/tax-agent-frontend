import httpClient from './httpClient';
import { FilePageContent } from '../types/file.types';

// Get all file contents for a case
export const getAllFileContentsForCase = async (caseId: string): Promise<FilePageContent[]> => {
  try {
    const response = await httpClient.get(`/file-content/case/${caseId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting all file contents for case:", error);
    throw error;
  }
};

