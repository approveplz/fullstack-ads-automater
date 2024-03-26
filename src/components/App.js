import { useContext } from 'react';
import { logout } from '../clientFirebase.js';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from './Home.js';
import Login from './Login.js';
import { TestingDeleteButton } from './Process.js';
import { UserContext } from '../UserContext.js';
import AppBar from './AppBar.js';

import { Page, PageContent, Text, Button } from 'grommet';

const App = () => {
    const { currentUser } = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <Page>
            <AppBar>
                <Text size="large">Facebook Ad Automater</Text>
                {currentUser ? (
                    <Button
                        label="Sign Out"
                        onClick={() => {
                            logout();
                            navigate('landing');
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
                    <Route
                        path="/"
                        element={<div>This is the landing page</div>}
                    />
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </PageContent>
            <TestingDeleteButton />;
        </Page>
    );
};

export default App;
