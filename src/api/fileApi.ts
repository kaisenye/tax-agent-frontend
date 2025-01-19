import httpClient from './httpClient';

export const getFiles = async (): Promise<File[]> => {
    const response = await httpClient.get('/files');
    return response.data;
};

export const uploadFile = async (file: File): Promise<File> => {
    if (!file) {
        throw new Error('File is required');
    }

    const formData = new FormData();
    console.log("file", file);
    
    if (file.size === 0) {
        throw new Error('File is empty');
    }
    
    formData.append('file', file);
    
    // Debug FormData contents using one of these methods:
    console.log("FormData contents:", ...formData); // Method 1
    // OR
    formData.forEach((value, key) => {              // Method 2
        console.log(`FormData ${key}:`, value);
    });
    
    const response = await httpClient.post('/original_file/upload_and_transform', formData);
    return response.data;
};