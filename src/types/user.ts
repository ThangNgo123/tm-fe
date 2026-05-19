export interface User {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  avatar?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}
