import { createContext } from 'react';

export const UserContext = createContext({
    agent: null,
    setUserContext: () => {}
});