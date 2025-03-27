export interface DocumentItem {
  id: string;
  content: string;
  name: string;
  original_file_path: string;
  page_location: string;
  precompute_tax_relevant_info: string;
  tags: string[];
  category: string;
}

// Type for raw DynamoDB item format before unmarshalling
export interface DynamoDBDocumentItem {
  id: { S: string };
  content: { S: string };
  name: { S: string };
  original_file_path: { S: string };
  page_location: { S: string };
  precompute_tax_relevant_info: { S: string };
  tags: { 
    M: {
      [category: string]: {
        L: Array<{ S: string }>
      }
    }
  };
} 