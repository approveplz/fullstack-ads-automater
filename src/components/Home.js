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
} from 'grommet';
import FileStorageAuth from './FileStorageAuth.js';
import CardTemplate from './CardTemplate.js';
 
import UserParameters from './UserParameters.js';

const Home = () => {
    return (
        <Box align="center" justify="start" pad="large" gap="medium" width='large'>
            <CardTemplate title="Authorize Your File Storage Provider">
                <FileStorageAuth />
            </CardTemplate>
            <CardTemplate title="Enter Your Parameters" width='large'>
                <UserParameters />
            </CardTemplate>
        </Box>
    );
};

export default Home;
