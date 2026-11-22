export type User = {
  ID: number;
  Name: string;
  Token?: string;
};
  
export type Place = {
  ID: number;
  Name: string;
  Latitude: number;
  Longitude: number;
  UserID: number;
};