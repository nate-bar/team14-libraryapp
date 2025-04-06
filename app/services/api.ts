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

export interface Book {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
  Authors: string;
  Publisher: string;
  PublicationYear: number;
  Language: string;
  ISBN: string;
  GenreName: string;
  Photo?: File | Blob | null;
}

export interface Media {
  ItemID: number;
  Title: string;
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
  Photo?: File | Blob | null;
}

export interface Device {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
  DeviceID: number;
  DeviceType: string;
  Manufacturer: string;
  Photo?: File | Blob | null;
}

export interface CartItem {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
  Category: "In Cart" | "On Hold";
}

// for inserting
export interface BookInsert {
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
  quantity: number;
}

// for inserting
export interface MediaInsert {
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
  quantity: number;
}

// for inserting
export interface DeviceInsert {
  title: string;
  typename: string;
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
  phoneNumber: string;
  birthDate: string;
  balance: string;
}

export interface Genres {
  GenreID: number;
  GenreName: string;
}

export interface Languages {
  LanguageID: number;
  Language: string;
}

// for editing
export interface BookEdit {
  ItemID: number;
  ISBN: string;
  newISBN: string;
  Title: string;
  TypeName: string;
  Authors: string;
  Publisher: string;
  PublicationYear: number;
  GenreID: number;
  LanguageID: number;
  Photo?: File | Blob | null;
  UpdatedBy: string;
}

// for editing
export interface MediaEdit {
  ItemID: number;
  MediaID: number;
  Title: string;
  TypeName: string;
  Director: string;
  Leads: string;
  ReleaseYear: number;
  Format: string;
  Rating: number;
  LanguageID: number;
  GenreID: number;
  Photo?: File | Blob | null;
  UpdatedBy: string;
}

// for editing
export interface DeviceEdit {
  ItemID: number;
  DeviceID: number;
  Title: string;
  TypeName: string;
  DeviceType: string;
  Manufacturer: string;
  Photo?: File | Blob | null;
  UpdatedBy: string;
}
