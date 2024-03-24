import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ReactDOM from 'react-dom/client';

import Root from './components/Root.js';
import ErrorPage from './components/ErrorPage.js';
import Login from './components/Login.js';
import Home from './components/Home.js';

import { UserContextProvider } from './UserContext.js';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: 'landing',
                element: <div>This is the landing page</div>,
            },
            {
                path: 'login',
                element: <Login />,
            },
            {
                path: 'home',
                element: <Home />,
            },
        ],
    },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <UserContextProvider>
            <RouterProvider router={router} />
        </UserContextProvider>
    </React.StrictMode>
);
