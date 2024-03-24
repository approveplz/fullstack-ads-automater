import axios from 'axios';

export async function apiCallWithAuth(user, endpoint) {
    const baseApiUrl =
        process.env.NODE_ENV === 'production'
            ? 'https://api-ccsi5asyva-uc.a.run.app'
            : 'http://127.0.0.1:5001/facebook-ads-automater/us-central1/api';

    const idToken = await user.getIdToken();
    const response = await axios.get(`${baseApiUrl}/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
    return response;
}
