// Define a type for all possible label values
export type LabelType = 
  | "ID_Verification" | "Client_Intake_Form" | "Bank_Info" | "W2" | "1099-NEC" | "1099-MISC" 
  | "1099-K" | "1099-G" | "1099-R" | "1099-INT" | "1099-DIV" | "1099-B" | "Crypto_Tax_Reports" 
  | "Rental_Income" | "Invoices" | "Receipts" | "PnL_Statements" | "Other_Income" | "Medical" 
  | "Cash_Donations" | "Non_Cash_Donations" | "Mortgage_and_Property_Tax" | "1098-T" | "1098-E" 
  | "Education_Other_Receipts" | "Retirement_Contributions" | "Child_and_Dependent_Care" 
  | "Advanced_Child_Tax_Credit" | "Stimulus_Recovery" | "EV_Credit" | "Education_Credits" 
  | "1040_ES_Receipts" | "State_Payments" | "form_1040" | "CP2000" | "Identity_Verification" 
  | "Other_Notices" | "Bank_Statements" | "Credit_Card_Statements" | "Notes";

// Color mapping for tax document labels
export const LABEL_COLORS: Record<LabelType, string> = {
  "ID_Verification": "bg-blue",
  "Client_Intake_Form": "bg-black",
  "Bank_Info": "bg-cyan",
  "W2": "bg-green",
  "1099-NEC": "bg-emerald",
  "1099-MISC": "bg-teal",
  "1099-K": "bg-lime",
  "1099-G": "bg-yellow",
  "1099-R": "bg-pink",
  "1099-INT": "bg-orange",
  "1099-DIV": "bg-red",
  "1099-B": "bg-rose",
  "Crypto_Tax_Reports": "bg-pink",
  "Rental_Income": "bg-fuchsia",
  "Invoices": "bg-purple",
  "Receipts": "bg-violet",
  "PnL_Statements": "bg-blue",
  "Other_Income": "bg-indigo",
  "Medical": "bg-cyan",
  "Cash_Donations": "bg-green",
  "Non_Cash_Donations": "bg-emerald",
  "Mortgage_and_Property_Tax": "bg-teal",
  "1098-T": "bg-lime",
  "1098-E": "bg-yellow",
  "Education_Other_Receipts": "bg-amber",
  "Retirement_Contributions": "bg-orange",
  "Child_and_Dependent_Care": "bg-red",
  "Advanced_Child_Tax_Credit": "bg-rose",
  "Stimulus_Recovery": "bg-pink",
  "EV_Credit": "bg-fuchsia",
  "Education_Credits": "bg-purple",
  "1040_ES_Receipts": "bg-violet",
  "State_Payments": "bg-blue",
  "form_1040": "bg-indigo",
  "CP2000": "bg-cyan",
  "Identity_Verification": "bg-green",
  "Other_Notices": "bg-emerald",
  "Bank_Statements": "bg-teal",
  "Credit_Card_Statements": "bg-lime",
  "Notes": "bg-yellow"
};

// Helper function to get color for a label
export const getLabelColor = (label: string): string => {
  // Check if the label exists in our mapping
  if (label in LABEL_COLORS) {
    return LABEL_COLORS[label as LabelType];
  }
  return "bg-gray";
}; 