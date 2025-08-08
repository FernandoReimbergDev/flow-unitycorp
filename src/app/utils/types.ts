export type User = {
    name: string
    image: string
    username: string
}

export type JWTData = {
    exp: number; // timestamp
};

export type AuthContextType = {
    accessToken: string | null
    user: User | null
    signIn: (badge: string) => Promise<boolean>
    signOut: () => void
    refreshToken: () => Promise<boolean>
}