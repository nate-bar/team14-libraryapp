// member
export interface Member {
  memberId: number;
  email: string;
  password: string;
}

export interface UserProfile { //breh
  memberId: number;
  firstName: string;
  lastName: string;
  middleName?: string;
}

export interface Profile {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  address: string;
  balance: number;
  memberGroup: string;
  lendingPeriod: number;
  itemLimit: number;
  mediaItemLimit: number;
  deviceLimit: number;
}

export interface Notification {
  id: number;
  memberID: number;
  message: string;
  created_at: string; // or Date if you're converting to a JS Date object
  is_read: boolean;
  BorrowID: number;
  type: string;
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

export interface BorrowedItem extends Items {
  BorrowID: number;
  MemberID: number;
  ItemID: number;
  DueDate: string;
  Title: string;
  TypeName: string;
  PhotoBase64?: string;
  FirstName: string;
  MiddleName?: string;
  LastName: string;
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
  Summary: string;
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
  Category: "In Cart";
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
  summary?: string;
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
  user?: Member; // honestly dont know what this is for
}

// (4) ADD IT IN HERE
// now go to layouyt and fix any errors
export interface AuthData {
  isLoggedIn: boolean;
  memberID: number;
  groupID: string;
  firstName: string;
  lastName: string;
  email: string;
}

//edit profile --> routes/profile/settings.tsx
export interface EditProfile {
  memberID: number;
  firstName: string;
  middleName: string;
  lastName: string;
  address: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
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
  Summary?: string;
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

export interface ItemFull {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
  Photo?: string;
  ISBN?: string;
  MediaID?: number;
  DeviceID?: number;
  Authors?: string;
  GenreName?: string;
  Publisher?: string;
  PublicationYear?: string;
  Summary?: string;
  Language?: string;
  Director?: string;
  Leads?: string;
  ReleaseYear?: string;
  Format?: string;
  Rating?: number;
  DeviceType?: string;
  Manufacturer?: string;
}

// creating event
export interface CreateEventRequest {
  EventName: string;
  StartDate: string;
  EndDate: string;
  EventDescription: string;
  photo: File | null;
}

export interface Event {
  EventID: number;
  EventName: string;
  StartDate: string;
  EndDate: string;
  EventDescription: string;
  EventPhoto?: string | null;
}

export interface EventItem {
  ItemID: number;
  Title: string;
  TypeName: string;
  Status: string;
  LastUpdated: string;
  CreatedAt: string;
  TimesBorrowed: number;
  GenreID?: number;
  GenreName?: string;
  Photo?: string | null;
}

export interface GalleryImage {
  src: string;
  caption: string;
  link: string;
}

