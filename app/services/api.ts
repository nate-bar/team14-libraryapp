// member
export interface Member {
  memberId: number;
  email: string;
  password: string;
}

/*******************************************
 **************ITEM INTERFACE,***************
 *******REPRESENTS ITEM IN Items TABLE*******
 *******************************************/
export interface Items {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
  GenreID?: number; // Optional if not all items have genres
  GenreName?: string; // Optional if not all items have genres
  Photo?: string; // Optional for item images
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
  Photo?: string;
}

export interface Media {
  ItemID: number;
  TypeName: string;
  Status: string;
  MediaID: number;
  Director: string;
  Leads: string;
  ReleaseYear: number;
  GenreName: string;
  Language: string;
  Format: string;
  Rating: number;
  Photo?: string;
}

export interface Device {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
  DeviceID: number;
  DeviceType: string;
  Manufacturer: string;
  Photo?: string;
}

// sign up interface
export interface AccountSignup {
  email: string;
  password: string;
  groupID: string;
  firstName: string;
  middleName?: string; // making these optional fields I dont really want to be required to give out this info
  lastName: string;
  address?: string; // also its more of a reflection in the database, idk its like if its not not null in the database
  phoneNumber: string; // we will keep required for phonenumber
  birthDate: string; // and birth date cause maybe we can do something with that
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

export interface Genres {
  GenreID: number;
  GenreName: string;
}
