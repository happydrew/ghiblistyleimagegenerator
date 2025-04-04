import React, { useEffect, useState } from "react";
import TextField from '@mui/material/TextField';
import { verifyEmailCode } from "@lib/auth";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import { sendEmailVerifyCode } from "@lib/auth";
import { Footer } from "./Footer";

// 完整的登录页面
export default function SignupVerifyForm(): React.ReactNode {

    const { email, password } = useLocation().state || {};
    const [verfiyCode, setVerfiyCode] = useState('');
    const [verifyCodeFormatError, setVerifyCodeFormatError] = useState(null);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [verfiyCodeError, setVerfiyCodeError] = useState(null);
    const [isResendingCode, setIsResendingCode] = useState(false);
    const [resendCodeError, setResendCodeError] = useState(null);
    const navigate = useNavigate();

    function verifyCodeFormat(code: string): boolean {
        // 验证码格式校验
        const codeRegex = /^\d{6}$/;
        return codeRegex.test(code);
    }

    function onVerfiyCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
        setVerifyCodeFormatError(null);
        setVerfiyCodeError(null);
        setVerfiyCode(e.target.value);
    }

    // 验证邮箱验证码
    async function verify(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!verfiyCode || !verifyCodeFormat(verfiyCode)) {
            setVerifyCodeFormatError('Please enter 6-digit verification code.');
            return;
        }
        try {
            setIsVerifyingCode(true);
            const { success, error } = await verifyEmailCode(email, password, verfiyCode);
            if (success) {
                navigate('/signup/success', { state: { email, password } });
                console.log('verify success');
            } else {
                setVerfiyCodeError(error);
            }
        } finally {
            setIsVerifyingCode(false);
        }
    }

    async function resendCode() {
        try {
            setIsResendingCode(true);
            setResendCodeError(null);
            const { success, error } = await sendEmailVerifyCode(email);
            if (!success) {
                setResendCodeError(error);
            } else {
                console.log('resend code success');
                alert('Verification code has been sent to your email.');
            }
        } finally {
            setIsResendingCode(false);
        }
    }

    useEffect(() => {
        if (!email || !password) {
            // 未从注册页面跳转过来，直接跳转到注册页面
            navigate('/signup');
        }
    }, []);

    return (
        <div className="w-full flex justify-center items-center p-6 md:p-10">
            <div className="max-w-md p-10 bg-white rounded-lg shadow-lg border-solid border-[1px] border-gray-200">
                <h2 className="flex justify-center items-center text-2xl font-semibold mb-3 text-gray-700">Verify Your Code</h2>
                <div className="popup-body">
                    <div className=" popup-body-item text-[16px] leading-[1.25em] text-center text-gray-500 w-full whitespace-normal break-words">
                        Please <strong>check your email</strong>, enter the 6-digit code below to complete your verification process.
                        <br />
                        Note: The code will expire in <strong>10 minutes</strong>.
                    </div>
                </div>

                <form className="space-y-5 mt-6" onSubmit={verify}>
                    <TextField
                        label="Verification Code"
                        variant="outlined"
                        fullWidth
                        value={verfiyCode}
                        onChange={onVerfiyCodeChange}
                        error={Boolean(verifyCodeFormatError)}
                        helperText={verifyCodeFormatError}
                        inputProps={{ maxLength: 6 }}
                    />
                    <div>
                        <button type='submit'
                            className="flex justify-center items-center w-full h-12 py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-base">
                            Verify
                            <CircularProgress sx={{ color: 'white', ml: 1 }} size={20} thickness={5}
                                className={`${isVerifyingCode ? '' : 'invisible '}`} />
                        </button>
                        <div className={`${verfiyCodeError ? '' : 'invisible '}text-red-500 text-sm px-4 py-2 break-words`}>
                            {verfiyCodeError}
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
                            <Link to="/signup" className="text-sm text-primary-500 hover:text-primary-700">Go back</Link>
                        </div>
                    </div>
                </form>
                <Footer />
            </div>
        </div>
    );
}