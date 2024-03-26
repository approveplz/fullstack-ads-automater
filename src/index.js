import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';

import App from './components/App.js';
import { UserContextProvider } from './UserContext.js';
import { Grommet, grommet } from 'grommet';
import { deepMerge } from 'grommet/utils/index.js';

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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <UserContextProvider>
            <BrowserRouter>
                <Grommet theme={theme}>
                    {/* <RouterProvider router={router} /> */}
                    <App />
                </Grommet>
            </BrowserRouter>
        </UserContextProvider>
    </React.StrictMode>
);
