export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  role: 'customer' | 'admin' | null;
}
