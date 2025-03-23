// member
export interface Member {
  memberId: number;
  email: string;
  password: string;
}

export interface CartItem {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
  Category: "In Cart" | "On Hold";
}

export interface Book {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
  Authors: string;
  Publisher: string;
  PublicationYear: number;
  ISBN: string;
  GenreName: string;
}

export interface Device {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
  DeviceID: number;
  DeviceType: string;
  Manufacturer: string;
}

// sign up interface
export interface AccountSignup {
  email: string;
  password: string;
  group: string;
  firstName: string;
  middleName?: string;
  lastName: string;
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

// (4) ADD IT IN HERE
// now go to layouyt and fix any errors
export interface AuthData {
  isLoggedIn: boolean;
  memberID: number | null;
  groupID: string | null;
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  middleName: string | null;
}

export interface Items {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
}
