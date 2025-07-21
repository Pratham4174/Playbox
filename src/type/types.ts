export type Sport = {
    id: string;
    name: string;
    slots: string[];
  };
  // src/types/User.ts
export interface User {
  name: string;
  phone: string;
  image?: string;
}
export type SportPrice = {
  sport: string;
  pricePerHour: string;
};