'use client';

import { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function Logout() {
    const { signOut } = useAuth();

    useEffect(() => {
        signOut();
    }, [signOut]);

    return null;
}
