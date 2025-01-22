import httpClient from './httpClient';
import { FileRecord } from '../types/file.types';

// TODO: Implement Get Files
export const getAllFiles = async (): Promise<Array<FileRecord>> => {
    const response = await httpClient.get('/official_files/query');
    console.log("Response", response);
    return response.data;
};

// POST: Upload File
export const uploadFile = async (file: File): Promise<File> => {
    if (!file) {
        throw new Error('File is required');
    }

    const formData = new FormData();

    if (file.size === 0) {
        throw new Error('File is empty');
    }
    
    formData.append('file', file);

    const response = await httpClient.post(
        '/original_file/upload_and_transform', 
        formData, 
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    
    return response.data;
};