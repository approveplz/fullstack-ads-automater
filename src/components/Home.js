import {
    useAuth,
    logout,
    saveUserParameters,
    getUserParameters,
} from '../clientFirebase.js';
import { useEffect, useState } from 'react';
import axios from 'axios';

// TODO ad validation
// TODO fix UI
const Home = () => {
    useEffect(() => {
        const params = getUserParameters().then((x) => console.log(x));
    }, []);

    const [formData, setFormData] = useState({
        campaignName: 'Campaign Name',
        adSetName: 'Ad Set Name',
        adName: 'Ad Name',
        campaignObjective: 'OUTCOME_TRAFFIC',
        bidStrategy: 'LOWEST_COST_WITH_BID_CAP',
        dailyBudget: '2000',
        bidAmount: '1',
        billingEvent: 'IMPRESSIONS',
        optimizationGoal: 'LANDING_PAGE_VIEWS',
        dropboxInputFolder: '/input-media',
        dropboxProcessedFolder: '/processed-media',
        adCreativeName: 'Ad Creative Name',
        bodies: [
            'body text 1',
            'body text 2',
            'body text 3',
            'body text 4',
            'body text 5',
        ],
        titles: [
            'title text 1',
            'title text 2',
            'title text 3',
            'title text 4',
            'title text 5',
        ],
        descriptions: [
            'description text 1',
            'description text 2',
            'description text 3',
            'description text 4',
            'description text 5',
        ],
        websiteUrl: 'https://onno.com',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        await saveUserParameters(formData);
        console.log(formData);
        setLoading(false);
    };

    const handleProcess = async () => {
        const startTime = Date.now();

        const idToken = await currentUser.getIdToken();
        const baseUrl = 'http://127.0.0.1:5001';
        setLoading(true);

        const response = await axios.get(
            `${baseUrl}/facebook-ads-automater/us-central1/process`,
            {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            }
        );

        console.log('Response data:', response.data);
        setLoading(false);

        const endTime = Date.now();
        const elapsedTime = endTime - startTime; // Elapsed time in milliseconds
        console.log(`Elapsed time: ${elapsedTime / 1000} sec`);
    };

    const handleTestDelete = async () => {
        setLoading(true);

        const response = await axios.get(
            'http://127.0.0.1:5001/facebook-ads-automater/us-central1/deleteVideos'
        );

        setLoading(false);
    };

    const currentUser = useAuth();
    // console.log({ currentUser });

    return (
        <div>
            <h2>Enter your parameters</h2>
            <form onSubmit={handleSubmit}>
                <h3>Dropbox Parameters</h3>
                <div>
                    <label>Dropbox Input Folder Name:</label>
                    <input
                        type="text"
                        name="dropboxInputFolder"
                        value={formData.dropboxInputFolder}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Dropbox Processed Folder Name:</label>
                    <input
                        type="text"
                        name="dropboxProcessedFolder"
                        value={formData.dropboxProcessedFolder}
                        onChange={handleChange}
                    />
                </div>

                <h3>Campaign Parameters</h3>
                <div>
                    <label>Campaign Name:</label>
                    <input
                        type="text"
                        name="campaignName"
                        value={formData.campaignName}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    {/* this should be dropdown */}
                    <label>Campaign Objective:</label>
                    <input
                        type="text"
                        name="objective"
                        value={formData.campaignObjective}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    {/* this should be dropdown */}
                    <label>Bid Strategy:</label>
                    <input
                        type="text"
                        name="bidStrategy"
                        value={formData.bidStrategy}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Daily Budget:</label>
                    <input
                        type="number"
                        name="dailyBudget"
                        value={formData.dailyBudget}
                        onChange={handleChange}
                    />
                </div>

                <h3>Ad Set Parameters</h3>
                <div>
                    <label>Ad Set Name:</label>
                    <input
                        type="text"
                        name="adSetName"
                        value={formData.adSetName}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Bid Amount:</label>
                    <input
                        type="number"
                        name="bidAmount"
                        value={formData.bidAmount}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    {/* this should be dropdown */}
                    <label>Billing Event:</label>
                    <input
                        type="text"
                        name="billingEvent"
                        value={formData.billingEvent}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    {/* this should be dropdown */}
                    <label>Optimization Goal:</label>
                    <input
                        type="text"
                        name="optimizationGoal"
                        value={formData.optimizationGoal}
                        onChange={handleChange}
                    />
                </div>

                {/* Ad creative params */}
                <h3>Ad Creative Parameters</h3>
                <div>
                    <label>Ad Creative Name:</label>
                    <input
                        type="text"
                        name="adCreativeName"
                        value={formData.adCreativeName}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Bodies (comma-separated):</label>
                    <input
                        type="text"
                        name="bodies"
                        value={formData.bodies.join(',')}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Titles (comma-separated):</label>
                    <input
                        type="text"
                        name="titles"
                        value={formData.titles.join(',')}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Descriptions (comma-separated) :</label>
                    <textarea
                        name="descriptions"
                        value={formData.descriptions.join(',')}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Website URL:</label>
                    <input
                        type="url"
                        name="websiteUrl"
                        value={formData.websiteUrl}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
            <button disabled={loading} onClick={logout}>
                Logout
            </button>
            <button disabled={loading} onClick={handleProcess}>
                Process
            </button>
            <button disabled={loading} onClick={handleTestDelete}>
                clean up for testing
            </button>
        </div>
    );
};

export default Home;
