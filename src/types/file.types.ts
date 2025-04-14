export interface FileRecord {
  case_id: string;
  file_id: string;
  file_name: string;
  file_page_contents: FilePageContent[];
  file_type_tag: string[];
  signed_url: string;
  status: string;
  uploaded_path: string;
}

export interface FilePageContent {
  case_id: string;
  content: string;
  file_id: string;
  file_name: string;
  file_type_tag: FileTypeTagItem[];
  page_num: string;
  precompute_tax_relevant_info: string;
  signed_url: string;
  source_file_path: string;
  tax_form_tag: any[];
  uploaded_path: string;
}

export interface FileTypeTagItem {
  label: string;
  reason: string;
}