import firebase from 'firebase/compat/app';

import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { auth } from '../clientFirebase.js';
import { useEffect } from 'react';

const Login = () => {
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
                    // Return true to redirect to signInSuccessUrl
                    return true;
                },
                uiShown: function () {
                    // This is what should happen when the form is full loaded
                },
            },
            signInSuccessUrl: '/home',
            signInOptions: [
                // This array contains all the ways an user can authenticate in your application. d
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
            <div id="firebaseui-auth-container"></div>
        </>
    );
};

export default Login;
