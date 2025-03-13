

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
    userID?: number;
}