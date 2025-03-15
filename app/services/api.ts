// member
export interface Member {
  memberId: number;
  email: string;
  password: string;
}

// sign up interface
export interface AccountSignup {
  email: string;
  password: string;
  group: string;
}

// login interface
export interface AccountLogin {
  email: string;
  password: string;
}

// API Response
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  userID?: number | string;
  user?: Member; // Add this property
}

export interface AuthData {
  isLoggedIn: boolean;
  memberID: number | null;
  groupID: string | null;
}
