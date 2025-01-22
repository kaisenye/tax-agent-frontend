// Types for chat functionality
export interface Reference {
    id: string;
    title: string;
    url?: string;
}

export interface ChatMessage {
    type: 'user' | 'bot';
    content: string;
    references?: Reference[];
}

export interface APIResponse {
    choices: [{
        message: {
            content: string;
        }
    }];
}
