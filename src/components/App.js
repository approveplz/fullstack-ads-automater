import { useContext, useEffect } from 'react';
import { logout } from '../clientFirebase.js';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './Home.js';
import Login from './Login.js';
import { TestingDeleteButton } from './Process.js';
import { UserContext } from '../UserContext.js';
import AppBar from './AppBar.js';

import { Page, PageContent, Text, Button } from 'grommet';
import LandingPage from './LandingPage.js';

const App = () => {
    const { currentUser, userInfoLoading } = useContext(UserContext);
    const navigate = useNavigate();

    const location = useLocation();

    useEffect(() => {
        // Do not redirect until the current user has been loaded
        if (userInfoLoading) {
            return;
        }

        if (currentUser && location.pathname === '/') {
            navigate('/home');
        } else if (!currentUser && location.pathname === '/home') {
            navigate('/');
        }
    }, [currentUser, navigate, location.pathname, userInfoLoading]);

    return (
        <Page>
            <AppBar>
                <Text size="large">Facebook Ad Automater</Text>
                {currentUser ? (
                    <Button
                        label="Sign Out"
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                    />
                ) : (
                    <Button
                        label="Login"
                        onClick={() => {
                            navigate('login');
                        }}
                    />
                )}
            </AppBar>
            <PageContent align="center">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </PageContent>
            <TestingDeleteButton />;
        </Page>
    );
};

export default App;
