import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import { sendResetPasswordCode } from "@lib/auth";
import EmailInput from "./EmailInput";
import { validEmailFormat } from '@/utils';
import { Footer } from "./Footer";

// 重置密码页面-发送邮箱验证码页面
export default function ResetPasswordForm(): React.ReactNode {

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(null);
    const [sendCodeError, setSendCodeError] = useState(null);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const navigate = useNavigate();

    // 发送邮箱验证码
    async function sendEmailCode(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            if (!email || !validEmailFormat(email)) {
                setEmailError('Please enter a valid email.');
                return;
            }
            setIsSendingCode(true);
            setSendCodeError(null);
            const { success, error } = await sendResetPasswordCode(email);
            if (success) {
                navigate('/reset-password/setpass', { state: { email } });
            } else {
                setSendCodeError(error);
            }
        } finally {
            setIsSendingCode(false);
        }
    }

    function onEmailChange(email: string) {
        setEmail(email);
        setEmailError(null);
        setSendCodeError(null);
    }

    return (
        <div className="max-w-md p-10 bg-white rounded-lg shadow-lg border-solid border-[1px] border-gray-200">
            <h2 className="flex justify-center items-center text-2xl font-semibold mb-3 text-gray-700">Reset Password</h2>
            <div className="popup-body">
                <div className=" popup-body-item text-[16px] leading-[1.25em] text-center text-gray-500 w-full whitespace-normal break-words">
                    Please input your email, and we will send you a verification code to reset your password.
                </div>
            </div>

            <form className="space-y-5 mt-6" onSubmit={sendEmailCode}>
                <EmailInput email={email} onEmailChange={onEmailChange} emailError={emailError} setEmailError={setEmailError} />
                <div>
                    <button type='submit'
                        className="flex justify-center items-center w-full h-12 py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-base">
                        Send Verification Code
                        <CircularProgress sx={{ color: 'white', ml: 1 }} size={20} thickness={5}
                            className={`${isSendingCode ? '' : 'invisible '}`} />
                    </button>
                    <div className={`${sendCodeError ? '' : 'invisible '}text-red-500 text-sm px-4 py-2 break-words`}>
                        {sendCodeError}
                    </div>
                    <div className="flex justify-center items-center mt-1">
                        <Link to="/" className="text-sm text-blue-500 hover:text-primary-700">Go back</Link>
                    </div>
                </div>
            </form>
            <Footer />
        </div>
    );
}