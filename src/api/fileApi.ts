import httpClient from './httpClient';
import { FileRecord, FileAPIResponse } from '../types/file.types';

// Get all files for a case
export const getAllFiles = async (caseId: string): Promise<Array<FileRecord>> => {
    try {
        const response = await httpClient.get(`/file/${caseId}`);
        console.log("Files response for case", caseId, ":", response);
        return response.data;
    } catch (error) {
        console.error("Error getting files:", error);
        throw error;
    }
};


export const getAllFilesByTag = async (caseId: string): Promise<FileAPIResponse> => {
    try {
        const response = await httpClient.get(`/file/${caseId}/by-tag`);
        console.log("Files response for case", caseId, ":", response);
        return response;
    } catch (error) {
        console.error("Error getting files:", error);
        throw error;
    }
};

// POST: Upload File
export const uploadFile = async (file: File): Promise<File> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await httpClient.post('/original_file/upload_and_transform', formData);
    return response.data;
};