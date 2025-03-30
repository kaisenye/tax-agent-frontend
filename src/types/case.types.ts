export interface Case {
  case_id: string;
  title: string;
  description: string;
  ssn?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  occupation?: string;
  filingStatus?: string;
  clientAddress?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCaseRequest {
  user_id: string;
  title?: string;
  description?: string;
  ssn?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  occupation?: string;
  filingStatus?: string;
  clientAddress?: string;
  status?: string;
} 