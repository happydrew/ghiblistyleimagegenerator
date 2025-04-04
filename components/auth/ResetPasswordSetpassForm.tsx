import React, { useEffect, useState } from "react";
import TextField from '@mui/material/TextField';
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import { sendEmailVerifyCode, resetPassword, sendResetPasswordCode } from "@lib/auth";
import PasswordInput from "./PasswordInput";
import { validatePasswordStrengthMid } from "@/utils";

// 完整的登录页面
export default function ResetPasswordSetpassForm(): React.ReactNode {

    const { email } = useLocation().state || {};
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(null);
    const [verfiyCode, setVerfiyCode] = useState('');
    const [verifyCodeError, setVerifyCodeError] = useState(null);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resetPasswordError, setResetPasswordError] = useState(null);
    const [isResendingCode, setIsResendingCode] = useState(false);
    const [resendCodeError, setResendCodeError] = useState(null);
    const navigate = useNavigate();

    function verifyCodeFormat(code: string): boolean {
        // 验证码格式校验
        const codeRegex = /^\d{6}$/;
        return codeRegex.test(code);
    }

    function onVerfiyCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
        setVerifyCodeError(null);
        setResetPasswordError(null);
        setVerfiyCode(e.target.value);
    }

    function onPasswordChange(password: string) {
        setPassword(password);
        setPasswordError(null);
        setResetPasswordError(null);
    }

    // 验证邮箱验证码
    async function onClickResetPassword() {
        let hasError = false;
        if (!verfiyCode || !verifyCodeFormat(verfiyCode)) {
            setVerifyCodeError('Please enter 6-digit verification code.');
            hasError = true;
        }
        if (!password) {
            setPasswordError('Please enter new password.');
            hasError = true;
        } else {
            const { valid, message } = validatePasswordStrengthMid(password);
            if (!valid) {
                setPasswordError('Password must be at least 8 characters long, contain letters and numbers.');
                hasError = true;
            }
        }
        if (hasError) {
            return;
        }
        try {
            setIsResettingPassword(true);
            setResetPasswordError(null);
            const { success, error } = await resetPassword(email, password, verfiyCode);
            if (success) {
                navigate('/reset-password/success', { state: { email, password } });
            } else {
                setResetPasswordError(error);
            }
        } finally {
            setIsResettingPassword(false);
        }
    }

    async function resendCode() {
        try {
            setIsResendingCode(true);
            setResendCodeError(null);
            const { success, error } = await sendResetPasswordCode(email);
            if (success) {
                console.log('resend resetPassword code success');
                alert('Verification code has been sent to your email.');
            } else {
                setResendCodeError(error);
            }
        } finally {
            setIsResendingCode(false);
        }
    }

    useEffect(() => {
        if (!email) {
            // 未从重置密码页面跳转过来，直接跳转到重置密码页面
            navigate('/reset-password');
        }
    }, []);

    return (
        <div className="w-full flex justify-center items-center p-6 md:p-10 bg-white">
            <div className="max-w-md p-10 bg-white rounded-lg shadow-lg border-solid border-[1px] border-gray-200">
                <h2 className="flex justify-center items-center text-2xl font-semibold mb-3 text-gray-700">
                    Set New Password
                </h2>
                <div className="popup-body">
                    <div className=" popup-body-item text-[16px] leading-[1.25em] text-center text-gray-500 w-full whitespace-normal break-words">
                        Please <strong>check your email</strong>, enter the 6-digit code，and then enter your <strong>new password</strong>.
                        <br />
                        Note: The code will expire in <strong>10 minutes</strong>.
                    </div>
                </div>

                <form className="space-y-5 mt-6">
                    <TextField
                        label="Verification Code"
                        variant="outlined"
                        fullWidth
                        value={verfiyCode}
                        onChange={onVerfiyCodeChange}
                        error={Boolean(verifyCodeError)}
                        helperText={verifyCodeError}
                        inputProps={{ maxLength: 6 }}
                    />

                    <PasswordInput label="New Password" password={password} onPasswordChange={onPasswordChange}
                        passwordError={passwordError} setPasswordError={setPasswordError} />
                    <div>
                        <button type='button'
                            onClick={onClickResetPassword}
                            className="flex justify-center items-center w-full h-12 py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-base">
                            Set Password
                            <CircularProgress sx={{ color: 'white', ml: 1 }} size={20} thickness={5}
                                className={`${isResettingPassword ? '' : 'invisible '}`} />
                        </button>
                        <div className={`${resetPasswordError ? '' : 'invisible '}text-red-500 text-sm px-4 py-2 break-words`}>
                            {resetPasswordError}
                        </div>
                        <button type='button'
                            onClick={resendCode}
                            className="flex justify-center items-center w-full h-12 py-2 px-4 bg-primary-100 hover:bg-primary-200 text-gray-500 rounded-lg text-base">
                            Resend Code
                            <CircularProgress sx={{ color: 'white', ml: 1 }} size={20} thickness={5}
                                className={`${isResendingCode ? '' : 'invisible '}`} />
                        </button>
                        <div className={`${resendCodeError ? '' : 'invisible '}text-red-500 text-sm px-4 py-2 break-words`}>
                            {resendCodeError}
                        </div>
                        <div className="flex justify-center items-center mt-1">
                            <Link to="/reset-password" className="text-sm text-primary-500 hover:text-primary-700">
                                Go back
                            </Link>
                        </div>
                    </div>
                </form>
                <div className="text-xs mt-4 text-center text-gray-500">
                    <a href="https://autoformai.floxai.top/docs/privacy-policy" className="mr-2 underline">Privacy Policy</a>|
                    <a href="#" className="ml-2 underline">Terms of Service</a>|
                    <a href="https://autoformai.floxai.top/docs/contact-us" className="ml-2 underline">Contact</a>
                </div>
            </div>
        </div>
    );
}