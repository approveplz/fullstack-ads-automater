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
import { Moon, Sun } from 'grommet-icons';

const CardTemplate = ({ title, children, footer }) => {
    // const size = useContext(ResponsiveContext);

    return (
        <Card>
            <CardHeader pad="medium">
                <Heading level={1} margin="none">
                    {title}
                </Heading>
            </CardHeader>
            <CardBody pad="medium">{children}</CardBody>
            <CardFooter pad="medium" background="background-contrast">
                {footer}
            </CardFooter>
        </Card>
    );
};

const apiUrl =
    process.env.NODE_ENV === 'production'
        ? 'https://api-ccsi5asyva-uc.a.run.app'
        : 'http://127.0.0.1:5001/facebook-ads-automater/us-central1/api';

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
        setLoading(true);

        console.log({ nodeEnv: process.env.NODE_ENV });

        try {
            const idToken = await currentUser.getIdToken();
            const url = `${apiUrl}/process`;

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                },
            });

            console.log('Response data:', response.data);
        } catch (error) {
            console.error('Error during the process:', error);
        } finally {
            setLoading(false);
            const endTime = Date.now();
            const elapsedTime = endTime - startTime;
            console.log(`Elapsed time: ${elapsedTime / 1000} sec`);
        }
    };

    const handleTestDelete = async () => {
        setLoading(true);

        const url = `${apiUrl}/cleanup`;

        const response = await axios.get(url);

        setLoading(false);
    };

    const currentUser = useAuth();

    return (
        <Box align="center" justify="start" pad="large" gap="medium">
            <Text pad="large">{JSON.stringify(formData)}</Text>
            <CardTemplate title="Enter your parameters">
                <Form onSubmit={handleSubmit}>
                    <Heading level={2}>Dropbox Parameters</Heading>
                    <FormField
                        label="Dropbox Input Folder Name"
                        name="dropboxInputFolder"
                    >
                        <TextInput
                            name="dropboxInputFolder"
                            value={formData.dropboxInputFolder}
                            onChange={handleChange}
                        />
                    </FormField>
                    <FormField
                        label="Dropbox Processed Folder Name"
                        name="dropboxProcessedFolder"
                    >
                        <TextInput
                            name="dropboxProcessedFolder"
                            value={formData.dropboxProcessedFolder}
                            onChange={handleChange}
                        />
                    </FormField>
                    <Heading level={2}>Campaign Parameters</Heading>
                    <FormField label="Campaign Name" name="campaignName">
                        <TextInput
                            name="campaignName"
                            value={formData.campaignName}
                            onChange={handleChange}
                        />
                    </FormField>
                    <FormField label="Campaign Objective" name="objective">
                        <Select
                            name="objective"
                            options={[
                                {
                                    label: 'Outcome Traffic',
                                    value: 'OUTCOME_TRAFFIC',
                                },
                            ]}
                            value={formData.campaignObjective}
                            labelKey="label"
                            valueKey="value"
                        />
                    </FormField>
                    <FormField label="Bid Strategy" name="bidStrategy">
                        <Select
                            name="bidStrategy"
                            options={[
                                {
                                    label: 'Lowest Cost With Bid Cap',
                                    value: 'LOWEST_COST_WITH_BID_CAP',
                                },
                            ]}
                            value={formData.bidStrategy}
                            labelKey="label"
                            valueKey="value"
                        />
                    </FormField>
                    <FormField label="Daily Budget:" name="dailyBudget">
                        {/* Add validation to make sure its a number */}
                        <TextInput
                            name="dailyBudget"
                            value={formData.dailyBudget}
                            onChange={handleChange}
                        />
                    </FormField>
                    <Heading level={2}>Ad Set Parameters</Heading>
                    <FormField label="Ad Set Name:" name="adSetName">
                        <TextInput
                            name="adSetName"
                            value={formData.adSetName}
                            onChange={handleChange}
                        />
                    </FormField>
                    <FormField label="Bid Amount" name="bidAmount">
                        <TextInput
                            type="number"
                            name="bidAmount"
                            value={formData.bidAmount}
                            onChange={handleChange}
                        />
                    </FormField>
                    <FormField label="Billing Event" name="billingEvent">
                        <Select
                            name="billingEvent"
                            labelKey="label"
                            valueKey="value"
                            options={[
                                {
                                    label: 'Impressions',
                                    value: 'IMPRESSIONS',
                                },
                            ]}
                            value={formData.billingEvent}
                            onChange={handleChange}
                        />
                    </FormField>
                    <FormField
                        label="Optimization Goal"
                        name="optimizationGoal"
                    >
                        <Select
                            name="optimizationGoal"
                            labelKey="label"
                            valueKey="value"
                            options={[
                                {
                                    label: 'Landing Page Views',
                                    value: 'LANDING_PAGE_VIEWS',
                                },
                            ]}
                            value={formData.optimizationGoal}
                            onChange={handleChange}
                        />
                    </FormField>
                    <Heading level={2}>Ad Creative Parameters</Heading>
                    <FormField label="Ad Creative Name" name="adCreativeName">
                        <TextInput
                            name="adCreativeName"
                            value={formData.adCreativeName}
                            onChange={handleChange}
                        />
                    </FormField>
                    <FormField label="Bodies (comma-separated)" name="bodies">
                        <TextInput
                            name="bodies"
                            value={formData.bodies.join(',')}
                            onChange={(e) =>
                                handleChange({
                                    ...e,
                                    target: {
                                        ...e.target,
                                        value: e.target.value.split(','),
                                    },
                                })
                            }
                        />
                    </FormField>
                    <FormField label="Titles (comma-separated)" name="titles">
                        <TextInput
                            name="titles"
                            value={formData.titles.join(',')}
                            onChange={(e) =>
                                handleChange({
                                    ...e,
                                    target: {
                                        ...e.target,
                                        value: e.target.value.split(','),
                                    },
                                })
                            }
                        />
                    </FormField>
                    <FormField
                        label="Descriptions (comma-separated)"
                        name="descriptions"
                    >
                        <TextArea
                            name="descriptions"
                            value={formData.descriptions.join(',')}
                            onChange={(e) =>
                                handleChange({
                                    ...e,
                                    target: {
                                        ...e.target,
                                        value: e.target.value.split(','),
                                    },
                                })
                            }
                        />
                    </FormField>
                    <FormField label="Website URL" name="websiteUrl">
                        <TextInput
                            type="url"
                            name="websiteUrl"
                            value={formData.websiteUrl}
                            onChange={handleChange}
                        />
                    </FormField>
                    <Button
                        disabled={loading}
                        busy={loading}
                        label="Save Parameters"
                        primary
                    />
                </Form>
            </CardTemplate>

            <Button
                primary
                label="Process"
                icon={<Sun />}
                disabled={loading}
                busy={loading}
                onClick={handleProcess}
                tip={{
                    content: (
                        <Box pad="small" round="small" background="light-3">
                            Create Facebook Ads
                        </Box>
                    ),
                }}
            />
            <button disabled={loading} onClick={handleTestDelete}>
                clean up for testing
            </button>
            <Grid columns="medium" gap="large" pad={{ bottom: 'large' }}>
                <CardTemplate title="this is a card" />
                <CardTemplate title="this is another card" />
                <CardTemplate title="this is a third card" />
            </Grid>
        </Box>
    );
};

export default Home;
