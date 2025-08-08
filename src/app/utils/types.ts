export type User = {
  name: string;
  image: string;
  username: string;
};

export type JWTData = {
  name: string;
  image: string;
  username: string;
  exp: number; // timestamp
};

export type AuthContextType = {
  accessToken: string | null;
  user: User | null;
  signIn: (badge: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};
