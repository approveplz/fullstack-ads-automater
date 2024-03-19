import { signUp, useAuth, logout } from '../firebase.js';
import { useState } from 'react';

const SignUp = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const currentUser = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        await signUp(email, password);
        // Reset the form
        setEmail('');
        setPassword('');
        setLoading(false);
    };

    return (
        <div>
            <div>currently logged in as: {currentUser?.email}</div>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        minLength={6}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default SignUp;
