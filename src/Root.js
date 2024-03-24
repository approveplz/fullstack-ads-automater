import { Outlet } from 'react-router-dom';
import { useAuth, logout } from './clientFirebase.js';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Grommet,
    Page,
    PageContent,
    PageHeader,
    Text,
    Button,
    grommet,
} from 'grommet';
import { deepMerge } from 'grommet/utils/index.js';
import AppBar from './components/AppBar.js';

const theme = deepMerge(grommet, {
    global: {
        colors: {
            brand: '#228BE6',
        },
        font: {
            family: 'Roboto',
            size: '18px',
            height: '20px',
        },
    },
});

const Root = () => {
    const currentUser = useAuth();
    const navigate = useNavigate();

    return (
        <Grommet theme={theme}>
            <Page>
                <AppBar>
                    <Text size="large">My App</Text>
                    {currentUser ? (
                        <Button
                            label="Sign Out"
                            // disabled={loading}
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
                <PageContent>
                    <Outlet />
                </PageContent>
            </Page>
        </Grommet>
    );
};

export default Root;
