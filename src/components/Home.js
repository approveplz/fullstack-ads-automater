import { signUp, useAuth, logout, auth } from '../firebase.js';
import { useState } from 'react';

const Home = () => {
    const [loading, setLoading] = useState(false);
    const [campaignName, setCampaignName] = useState('');
    const [adSetName, setAdSetName] = useState('');
    const currentUser = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        // save params here
    };

    return (
        <div>
            <h2>Enter your params</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Campaign name:</label>
                    <input
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Adset name:</label>
                    <input
                        value={adSetName}
                        onChange={(e) => setAdSetName(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    Submit
                </button>
            </form>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default Home;
