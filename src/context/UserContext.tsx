import React, { createContext, useContext, useState } from 'react';

type User = {
  phoneNumber: string;
  name: string;
  role: 'PLAYER' | 'OWNER';
  verified: boolean;
};

type Location = {
  latitude: number;
  longitude: number;
  city?: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  location: Location | null;
  setLocation: (loc: Location | null) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  location: null,
  setLocation: () => {},
});

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [location, setLocation] = useState<Location | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser, location, setLocation }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
