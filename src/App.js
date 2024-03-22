import Root from './components/Root.js';
import {
    Grommet,
    Header,
    Page,
    PageContent,
    PageHeader,
    Text,
    Button,
    grommet,
} from 'grommet';

import { useAuth, logout } from './clientFirebase.js';
import { deepMerge } from 'grommet/utils/index.js';

const theme = deepMerge(grommet, {
    global: {
        colors: {
            brand: '#228BE6',
        },
        font: {
            family: 'Roboto',
            size: '18px',
            height: '20px',
        },
    },
});

const AppBar = (props) => (
    <Header
        background="brand"
        pad={{ left: 'medium', right: 'small', vertical: 'small' }}
        elevation="medium"
        {...props}
    />
);

function App() {
    const currentUser = useAuth();

    return (
        <div className="App">
            <Grommet theme={theme}>
                <Page>
                    <AppBar>
                        <Text size="large">My App</Text>
                        {currentUser && (
                            <Button
                                label="Sign Out"
                                // disabled={loading}
                                onClick={logout}
                            />
                        )}
                    </AppBar>
                    <PageContent>
                        <PageHeader title="Welcome to my App"></PageHeader>
                        <Root />
                    </PageContent>
                </Page>
            </Grommet>
        </div>
    );
}

export default App;
