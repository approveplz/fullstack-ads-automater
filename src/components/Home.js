import {
    useAuth,
    logout,
    saveUserParameters,
    getUserParameters,
} from '../clientFirebase.js';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import {
    Button,
    Box,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Grid,
    Heading,
    Paragraph,
    ResponsiveContext,
    Form,
    FormField,
    Select,
    TextInput,
    Text,
    TextArea,
    Tabs,
    Tab,
} from 'grommet';
import FileStorageAuth from './FileStorageAuth.js';
import CardTemplate from './CardTemplate.js';

import UserParameters from './UserParameters.js';
import Process from './Process.js';

const Home = () => {
    const [index, setIndex] = useState(0);
    const onActive = (nextIndex) => setIndex(nextIndex);

    return (
        <Box
            align="center"
            justify="start"
            pad="large"
            gap="medium"
            width="large"
        >
            <Tabs activeIndex={index} onActive={onActive}>
                <Tab title="Auth" width="large">
                    <CardTemplate title="Authorize Your Storage">
                        <FileStorageAuth />
                    </CardTemplate>
                </Tab>
                <Tab title="Set">
                    <CardTemplate title="Enter Your Parameters" width="large">
                        <UserParameters />
                    </CardTemplate>
                </Tab>
                <Tab title="Create">
                    <CardTemplate title="Create Facebook Ads">
                        <Process />
                    </CardTemplate>
                </Tab>
            </Tabs>
        </Box>
    );
};

export default Home;
