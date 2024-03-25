import { useState, useContext } from 'react';
import { UserContext } from '../UserContext.js';
import { apiCallWithAuth } from '../clientHelpers.js';
import { Box, Button, Text } from 'grommet';
import { Sun } from 'grommet-icons';

export const TestingDeleteButton = (currentUser) => {
    const [loading, setLoading] = useState(false);

    const handleTestDelete = async () => {
        setLoading(true);
        await apiCallWithAuth(currentUser, 'cleanup');
        setLoading(false);
    };

    return (
        <Button
            label="Delete Created Videos"
            onClick={handleTestDelete}
            busy={loading}
            disabled={loading}
        />
    );
};

const Process = () => {
    const [loading, setLoading] = useState(false);
    const { currentUser, userInfoFromFirestore } = useContext(UserContext);

    const handleProcess = async () => {
        const startTime = Date.now();
        setLoading(true);

        console.log({ nodeEnv: process.env.NODE_ENV });

        try {
            const response = await apiCallWithAuth(currentUser, 'process');
        } catch (error) {
            console.error('Error during the process:', error);
        } finally {
            setLoading(false);
            const endTime = Date.now();
            const elapsedTime = endTime - startTime;
            console.log(`Elapsed time: ${elapsedTime / 1000} sec`);
        }
    };

    return (
        <Box direction="row" justify="between">
            <Text size="xlarge">Create Facebook Ads</Text>
            <Button
                primary
                label="Process"
                icon={<Sun />}
                disabled={loading}
                busy={loading}
                onClick={handleProcess}
            />
        </Box>
    );
};

export default Process;
