import { Button, Form, Input, Space } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { signUp, useAuth, logout } from './src/firebase.js';
import { useState } from 'react';

const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
};

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [formValidated, setFormValidated] = useState(false);
    const [form] = Form.useForm();
    const currentUser = useAuth();

    const onFieldsChange = (_, allFields) => {
        // Check if all fields are touched and there are no errors
        const allTouched = allFields.every((field) => field.touched);
        const noErrors = !allFields.some((field) => field.errors.length > 0);
        setFormValidated(allTouched && noErrors);
    };

    const handleSignUp = async ({ email, password }) => {
        setLoading(true);
        try {
            console.log({ email, password });
            await signUp(email, password);
            setLoading(false);
        } catch (e) {
            console.log(e);
        }
    };

    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            console.log({ email, password });
            await signUp(email, password);
            setLoading(false);
        } catch (e) {
            console.log(e);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
        } catch (e) {
            console.log(e);
        }
        setLoading(false);
    };

    return (
        <div>
            currently logged in as: {currentUser?.email}
            <Form
                name="normal_login"
                className="login-form"
                onFinish={handleSignUp}
                onFinishFailed={onFinishFailed}
                form={form}
                onFieldsChange={onFieldsChange}
                {...layout}
            >
                <Form.Item
                    name="email"
                    rules={[
                        {
                            required: true,
                            type: 'email',
                            message: 'Please input your Email',
                        },
                    ]}
                >
                    <Input
                        prefix={
                            <UserOutlined className="site-form-item-icon" />
                        }
                        placeholder="Email"
                    />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Password',
                            min: 6,
                        },
                    ]}
                >
                    <Input
                        type="password"
                        prefix={
                            <LockOutlined className="site-form-item-icon" />
                        }
                        placeholder="Password"
                    />
                </Form.Item>
                {/* <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}> */}
                <Form.Item>
                    {/* <Space
                    direction="vertical"
                    size="small"
                    style={{ display: 'flex' }}
                > */}
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="login-form-button"
                        disabled={
                            loading || !formValidated || currentUser != null
                        }
                    >
                        Log in
                    </Button>
                    Or <a href="">register now!</a>
                    {/* </Space> */}
                    <Button onClick={logout} disabled={loading || !currentUser}>
                        Logout
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;
