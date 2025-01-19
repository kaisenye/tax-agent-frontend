// Extend the browser's File interface
export interface CustomFile extends File {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  url?: string;
}