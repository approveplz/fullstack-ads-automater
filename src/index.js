import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './Root.js';
import ErrorPage from './components/ErrorPage.js';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Auth from './components/Auth.js';
import Home from './components/Home.js';

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
                element: <Auth />,
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
        <RouterProvider router={router} />
    </React.StrictMode>
);
