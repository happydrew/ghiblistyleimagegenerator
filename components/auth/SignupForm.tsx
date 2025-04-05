import { useState } from 'react';
import PasswordInput from './PasswordInput';
import EmailInput from './EmailInput';
import { sendEmailVerifyCode } from '@lib/auth';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { validEmailFormat, validatePasswordStrengthMid } from '@/utils';
import { Footer } from './Footer';

// 登录表单
export default function SignupForm() {

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(null);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(null);
    const [isSignupWaiting, setIsSignupWaiting] = useState(false);
    const [signupError, setSignupError] = useState('');
    const navigate = useNavigate();

    // 发送邮箱验证码
    async function signup(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setSignupError(null);

        try {
            let hasError = false;
            if (!email) {
                hasError = true;
                setEmailError('Please enter email.');
            } else if (!validEmailFormat(email)) {
                hasError = true;
                setEmailError('Please enter a valid email.');
            }
            if (!password) {
                hasError = true;
                setPasswordError('Please enter password.');
            } else {
                const { valid, message } = validatePasswordStrengthMid(password);
                if (!valid) {
                    hasError = true;
                    setPasswordError('Password must be at least 8 characters long, contain letters and numbers.');
                }
            }
            if (hasError) {
                return;
            }
            setIsSignupWaiting(true);
            const { success, error } = await sendEmailVerifyCode(email);
            if (success) {
                navigate('/signup/verify', { state: { email, password } });
            } else {
                setSignupError(error);
            }
        } finally {
            setIsSignupWaiting(false);
        }
    }

    function onEmailChange(email: string) {
        setEmail(email);
        setEmailError(null);
        setSignupError(null);
    }

    function onPasswordChange(password: string) {
        setPassword(password);
        setPasswordError(null);
        setSignupError(null);
    }

    return (
        <div className="max-w-md p-10 bg-white rounded-lg shadow-lg">
            <h2 className="flex justify-center items-center text-2xl font-semibold mb-3 text-gray-700">
                Create your account
            </h2>
            <form className="space-y-5" onSubmit={signup}>
                <EmailInput email={email} onEmailChange={onEmailChange}
                    emailError={emailError} setEmailError={setEmailError} />
                <PasswordInput password={password} onPasswordChange={onPasswordChange}
                    passwordError={passwordError} setPasswordError={setPasswordError} />
                <div>
                    <button type='submit'
                        className="flex justify-center items-center w-full h-12 py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-base">
                        Sign Up
                        <CircularProgress sx={{ color: 'white', ml: 1 }} size={20} thickness={5}
                            className={`${isSignupWaiting ? '' : 'invisible '}`} />
                    </button>
                    <div className={`${signupError ? '' : 'invisible '}text-red-500 text-sm px-4 py-2 mt-1 break-words`}>{signupError}</div>
                    <div className='flex justify-center items-center mt-1'>
                        <span className='text-gray-500 text-sm'>Already have an account?</span>
                        <Link to="/" className="text-sm text-blue-500 hover:text-blue-600 ml-1">Log in</Link>
                    </div>
                </div>
            </form>

            <Footer />
        </div>
    );
}