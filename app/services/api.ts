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
  isbn: string;
  title: string;
  typename: string;
  authors: string;
  publisher: string;
  publicationyear: number;
  genreid: number;
  languageid: number;
  photo?: File | Blob | null;
  createdby: string;
}

export interface Media {
  title: string;
  typename: string;
  director: string;
  leads: string;
  releaseyear: number;
  format: string;
  rating: number;
  languageid: number;
  genreid: number;
  photo?: File | Blob | null;
  createdby: string;
}

export interface Device {
  title: string;
  typename: string;
  devicename: string;
  devicetype: string;
  manufacturer: string;
  photo?: File | Blob | null;
  createdby: string;
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
  memberID: number;
  groupID: string;
  firstName: string;
  lastName: string;
  address: string | null;
  middleName: string | null;
  email: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
}

//edit profile --> routes/profile/settings.tsx 
export interface EditProfile {
  firstName: string;
  lastName: string;
  address: string;
  middleName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
}

export interface Genres {
  GenreID: number;
  GenreName: string;
}

export interface Languages {
  LanguageID: number;
  Language: string;
}
