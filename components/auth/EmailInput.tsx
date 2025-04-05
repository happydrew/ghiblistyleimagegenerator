import React from 'react';
import { TextField } from '@mui/material';

const EmailInput = ({ email, onEmailChange, emailError, setEmailError }: {
    email: string,
    onEmailChange: (email: string) => void, className?: string,
    emailError?: string,
    setEmailError?: (message: string) => void
}) => {

    // 校验电子邮件格式
    // useEffect(() => {
    //     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //     if (email && !emailPattern.test(email)) {
    //         setEmailInvalidMessage('Please enter a valid email address.');
    //     } else {
    //         setEmailInvalidMessage(null);
    //     }
    // }, [email]);

    return (
        <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)} // 更新状态
            error={Boolean(emailError)} // 如果有错误则显示为红色
            helperText={emailError} // 显示错误提示
            fullWidth
            margin="normal"
        />
    );
};

export default EmailInput;
