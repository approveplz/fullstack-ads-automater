import Auth from './Auth';
import Home from './Home.js';
import { signUp, useAuth, logout, auth } from '../firebase.js';
import { useEffect, useState } from 'react';

const PAGE_AUTH = 'AUTH';
const PAGE_HOME = 'HOME';

const Root = () => {
    const currentUser = useAuth();
    console.log({ currentUser });

    const [page, setPage] = useState(PAGE_AUTH);

    useEffect(() => {
        if (currentUser) {
            setPage(PAGE_HOME);
        } else {
            setPage(PAGE_AUTH);
        }
    }, [currentUser]);

    return (
        <div>
            <div>Current logged in user: {currentUser?.email}</div>
            {page === PAGE_AUTH && <Auth />}
            {page === PAGE_HOME && <Home />}
        </div>
    );
};

export default Root;