// import { useAuth } from '../clientFirebase.js';
import { useContext, useEffect, useState } from 'react';
import { Button, Box, Text } from 'grommet';
import { Dropbox } from 'grommet-icons';
import { apiCallWithAuth } from '../clientHelpers.js';
import { UserContext } from '../UserContext.js';

const FileStorageAuth = () => {
    const [loading, setLoading] = useState(false);
    const { currentUser, userInfoFromFirestore } = useContext(UserContext);
    console.log({ userInfoFromFirestore });

    const handleAuthDropbox = async () => {
        setLoading(true);
        const response = await apiCallWithAuth(currentUser, 'auth/dropbox');
        const { redirectUrl } = response.data;

        window.location.href = redirectUrl;
    };

    const dropboxRefreshToken =
        userInfoFromFirestore?.dropboxAuthInfo?.dropboxRefreshToken;

    console.log({ dropboxRefreshToken });

    return (
        <Box direction="row" justify="between">
            <Text size="xlarge">Use Dropbox</Text>
            {!dropboxRefreshToken ? (
                <Button
                    label="Authorize"
                    busy={loading}
                    disabled={loading}
                    icon={<Dropbox color="#0061FE" />}
                    onClick={handleAuthDropbox}
                />
            ) : (
                <Button
                    label="Authorized"
                    disabled={true}
                    icon={<Dropbox color="#0061FE" />}
                />
            )}
        </Box>
    );
};

export default FileStorageAuth;
