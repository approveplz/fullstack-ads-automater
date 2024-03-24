import { useRouteError } from 'react-router-dom';

const ErrorPage = () => {
    const error = useRouteError();
    console.log(error);

    return (
        <div>
            <p>This is ther error page</p>
            <p>{error.statusText || error.message}</p>
        </div>
    );
};

export default ErrorPage;
