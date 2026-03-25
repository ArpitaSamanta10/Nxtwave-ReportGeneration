// Types file for components

export type Batch = {
  id: string;
  name: string;
  createdAt: string;
};

export type RemarksCategory = "Good" | "Above Average" | "Average" | "Poor" | "";

export type Student = {
  id: string;
  name: string;
  email: string;
  batchId: string;
  category: RemarksCategory;
  remarksDetails: any;
  updatedAt?: string;
};
