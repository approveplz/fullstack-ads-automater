import { Card, CardHeader, CardBody, CardFooter, Heading } from 'grommet';
const CardTemplate = ({ title, children, footer }) => {
    // const size = useContext(ResponsiveContext);

    return (
        <Card>
            <CardHeader pad="medium">
                <Heading level={2} margin="none">
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

export default CardTemplate;
