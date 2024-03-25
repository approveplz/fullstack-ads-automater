import { Outlet } from 'react-router-dom';
import { logout } from '../clientFirebase.js';
import { useContext } from 'react';
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
import { UserContext } from '../UserContext.js';
import AppBar from './AppBar.js';

import { TestingDeleteButton } from './Process.js';

const theme = deepMerge(grommet, {
    global: {
        // colors: {
        //     brand: '#228BE6',
        // },
        font: {
            family: 'Roboto',
            size: '18px',
            height: '20px',
        },
    },
    formField: {
        label: {
            weight: 'bold',
            size: 'xlarge',
        },
    },
    tab: {
        active: {
            color: 'brand',
        },
        color: 'black',
        border: {
            color: 'black',
            size: 'medium',
            active: {
                color: 'brand',
            },
        },
        pad: 'small',
        hover: {
            color: 'brand',
        },
    },
});

const Root = () => {
    const { currentUser } = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <Grommet theme={theme}>
            <Page>
                <AppBar>
                    <Text size="large">My App</Text>
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
                    <Outlet />
                </PageContent>
            </Page>
            {/* For testing only */}
            <TestingDeleteButton currentUser={currentUser} />
        </Grommet>
    );
};

export default Root;
