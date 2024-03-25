import {
    useAuth,
    logout,
    saveUserParameters,
    getUserParameters,
} from '../clientFirebase.js';
import { useContext, useEffect, useState } from 'react';
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
import FileStorageAuth from './FileStorageAuth.js';
import CardTemplate from './CardTemplate.js';

// TODO add validation
// TODO fix UI
const UserParameters = () => {
    useEffect(() => {
        const params = getUserParameters().then((x) => console.log(x));
    }, []);

    const [formData, setFormData] = useState({
        campaignName: 'Campaign Name',
        adSetName: 'Ad Set Name',
        adName: 'Ad Name',
        campaignObjective: 'OUTCOME_TRAFFIC',
        bidStrategy: 'LOWEST_COST_WITH_BID_CAP',
        dailyBudget: '3000',
        bidAmount: '1',
        billingEvent: 'IMPRESSIONS',
        optimizationGoal: 'LANDING_PAGE_VIEWS',
        dropboxInputFolder: '/input-media',
        dropboxProcessedFolder: '/processed-media',
        adCreativeName: 'Ad Creative Name',
        bodies: [
            'body text 1',
            'body text 3',
            'body text 3',
            'body text 4',
            'body text 5',
        ],
        titles: [
            'title text 1',
            'title text 3',
            'title text 3',
            'title text 4',
            'title text 5',
        ],
        descriptions: [
            'description text 1',
            'description text 3',
            'description text 3',
            'description text 4',
            'description text 5',
        ],
        websiteUrl: 'https://onno.com',
    });

    const [isEditable, setIsEditable] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        console.log('form submite');
        setLoading(true);
        await saveUserParameters(formData);
        console.log(formData);
        setLoading(false);
        setIsEditable(false);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Heading level={3} margin={{ top: 'none' }}>
                Dropbox Parameters
            </Heading>
            <FormField
                label="Dropbox Input Folder Name"
                name="dropboxInputFolder"
            >
                <TextInput
                    disabled={!isEditable}
                    size="small"
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
                    disabled={!isEditable}
                    size="small"
                    name="dropboxProcessedFolder"
                    value={formData.dropboxProcessedFolder}
                    onChange={handleChange}
                />
            </FormField>
            <Heading level={3}>Campaign Parameters</Heading>
            <FormField label="Campaign Name" name="campaignName">
                <TextInput
                    disabled={!isEditable}
                    size="small"
                    name="campaignName"
                    value={formData.campaignName}
                    onChange={handleChange}
                />
            </FormField>
            <FormField label="Campaign Objective" name="objective">
                <Select
                    disabled={!isEditable}
                    size="small"
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
                    disabled={!isEditable}
                    size="small"
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
                    disabled={!isEditable}
                    size="small"
                    name="dailyBudget"
                    value={formData.dailyBudget}
                    onChange={handleChange}
                />
            </FormField>
            <Heading level={3}>Ad Set Parameters</Heading>
            <FormField label="Ad Set Name:" name="adSetName">
                <TextInput
                    disabled={!isEditable}
                    size="small"
                    name="adSetName"
                    value={formData.adSetName}
                    onChange={handleChange}
                />
            </FormField>
            <FormField label="Bid Amount" name="bidAmount">
                <TextInput
                    disabled={!isEditable}
                    size="small"
                    type="number"
                    name="bidAmount"
                    value={formData.bidAmount}
                    onChange={handleChange}
                />
            </FormField>
            <FormField label="Billing Event" name="billingEvent">
                <Select
                    disabled={!isEditable}
                    size="small"
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
            <FormField label="Optimization Goal" name="optimizationGoal">
                <Select
                    disabled={!isEditable}
                    size="small"
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
            <Heading level={3}>Ad Creative Parameters</Heading>
            <FormField label="Ad Creative Name" name="adCreativeName">
                <TextInput
                    disabled={!isEditable}
                    size="small"
                    name="adCreativeName"
                    value={formData.adCreativeName}
                    onChange={handleChange}
                />
            </FormField>
            <FormField label="Bodies (comma-separated)" name="bodies">
                <TextInput
                    disabled={!isEditable}
                    size="small"
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
                    disabled={!isEditable}
                    size="small"
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
                    disabled={!isEditable}
                    size="small"
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
                    disabled={!isEditable}
                    size="small"
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                />
            </FormField>
            {isEditable ? (
                <Button
                    disabled={loading}
                    busy={loading}
                    label="Save Parameters"
                    type="submit"
                    primary
                />
            ) : (
                <Button
                    label="Edit Parameters"
                    primary
                    onClick={(e) => {
                        // The form is being submitted even with type='button' for some reason...
                        e.preventDefault();
                        setIsEditable(true);
                    }}
                />
            )}
        </Form>
    );
};

export default UserParameters;
