export type Role = "user" | "admin";
export type UserStatus = "pending" | "approved" | "rejected";
export type ReviewStatus = "pending" | "approved" | "rejected";

export type DocumentRecord = {
  id: string;
  user_id: string;
  document_type: string;
  file_url: string;
  status: ReviewStatus;
  uploaded_at: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  bank_account_number: string;
  bank_name: string;
  account_holder_name: string;
  ifsc_code: string;
  documents?: DocumentRecord[];
  created_at: string;
  updated_at: string;
};

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  role: "admin";
};

export type Task = {
  id: string;
  title: string;
  description: string;
  reward: number;
  instructions: string;
  required_minutes: number;
  is_active: boolean;
  created_at: string;
};

export type Attendance = {
  id: string;
  user_id: string;
  task_id: string;
  task?: Task | null;
  check_in: string;
  check_out: string | null;
  duration_minutes: number;
  completed: boolean;
  user?: UserProfile;
};

export type TaskSubmission = {
  id: string;
  user_id: string;
  task_id: string;
  task?: Task | null;
  remarks: string;
  proof_file: string | null;
  status: ReviewStatus;
  submitted_at: string;
  user?: UserProfile;
};
