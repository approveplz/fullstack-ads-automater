import firebase from 'firebase/compat/app';

import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { signUp, useAuth, logout, auth } from '../firebase.js';
import { useEffect } from 'react';

const Auth = () => {
    const currentUser = useAuth();

    useEffect(() => {
        const ui =
            firebaseui.auth.AuthUI.getInstance() ||
            new firebaseui.auth.AuthUI(auth);

        ui.start('#firebaseui-auth-container', {
            callbacks: {
                signInSuccessWithAuthResult: function (
                    authResult,
                    redirectUrl
                ) {
                    // Action if the user is authenticated successfully
                    console.log('sign in success');
                    console.log({ authResult });
                },
                uiShown: function () {
                    // This is what should happen when the form is full loaded. In this example, I hide the loader element.
                },
            },
            signInOptions: [
                // This array contains all the ways an user can authenticate in your application. For this example, is only by email.
                {
                    provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                    requireDisplayName: false,
                },
            ],
            tosUrl: 'https://www.example.com/terms-conditions', // URL to you terms and conditions.
            privacyPolicyUrl: function () {
                // URL to your privacy policy
                window.location.assign(
                    'https://www.example.com/privacy-policy'
                );
            },
        });
    }, []);

    return (
        <>
            <div>currently logged in as: {currentUser?.email}</div>
            <h1 className="text-center my-3 title">Login Page</h1>
            <div id="firebaseui-auth-container"></div>
            <button onClick={logout}>Logout</button>
        </>
    );
};

export default Auth;
