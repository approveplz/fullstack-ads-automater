import { Card, CardHeader, CardBody, CardFooter, Heading } from 'grommet';
const CardTemplate = ({ title, children, footer }) => {
    // const size = useContext(ResponsiveContext);

    return (
        <Card width="large">
            <CardHeader
                background="background-contrast"
                pad={{
                    vertical: 'medium',
                    horizontal: 'medium',
                    bottom: 'small',
                }}
            >
                <Heading level={2} margin="none">
                    {title}
                </Heading>
            </CardHeader>
            <CardBody
                // pad={{
                //     top: 'none',
                //     bottom: 'medium',
                //     horizontal: 'medium',
                // }}
                pad="medium"
            >
                {children}
            </CardBody>
            <CardFooter pad="medium" background="background-contrast">
                {footer}
            </CardFooter>
        </Card>
    );
};

export default CardTemplate;
