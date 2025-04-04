import { GoogleIcon } from '@components/icons';
import { useState } from 'react';
import '@style.css'
import { loginWithGoogle, loginWithEmailAndPassword } from '@lib/auth';
import PasswordInput from './PasswordInput';
import EmailInput from './EmailInput';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import { Link } from 'react-router-dom';
import { validEmailFormat } from '@/utils';
import { Footer } from './Footer';


// 登录表单
export default function LoginForm({ redirectTo }: { redirectTo: string }) {

    const [isLogingWithGoogle, setIsLogingWithGoogle] = useState(false);
    const [loginWithGoogleError, setLoginWithGoogleError] = useState(false);
    const [isLogingWithEmailAndPassword, setIsLogingWithEmailAndPassword] = useState(false);
    const [loginWithEmailAndPasswordError, setLoginWithEmailAndPasswordError] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [showFeatureLimitMessage, setShowFeatureLimitMessage] = useState(false);

    // 功能限制提示信息
    const featureLimitMessage = "Currently only Google login is supported. Other login methods and registration will be implemented soon.";

    async function handleLoginWithGoogle() {
        try {
            setIsLogingWithGoogle(true);
            setLoginWithGoogleError(false);
            const { user, errorCode } = await loginWithGoogle(redirectTo);
            if (errorCode) {
                throw new Error(`login with google failed: ${errorCode}`);
            }
            // 等待自动跳转到首页
        } catch (e) {
            console.error("login error", e);
            setLoginWithGoogleError(true);
            setIsLogingWithGoogle(false);
        }
    }

    async function handleLoginWithEmailAndPassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // 显示功能限制提示
        setShowFeatureLimitMessage(true);
        return;

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
        }
        if (hasError) {
            return;
        }
        try {
            setIsLogingWithEmailAndPassword(true);
            setLoginWithEmailAndPasswordError(null);
            const { user, errorCode } = await loginWithEmailAndPassword(email, password);
            if (errorCode == 'invalid_credentials') { // 邮箱或密码错误
                setLoginWithEmailAndPasswordError('Email or password is incorrect.');
                setIsLogingWithEmailAndPassword(false);
            } else if (errorCode) { // 其他错误
                throw new Error(`login with email and password failed: ${errorCode}`);
            }
            // 登录成功，等待自动跳转到首页
        } catch (e) {
            console.error("login failed", e);
            setLoginWithEmailAndPasswordError('Oops! Login failed, Please try again later.');
            setIsLogingWithEmailAndPassword(false);
        }
    }

    function onEmailChange(email: string) {
        setEmail(email);
        setEmailError(null);
        setLoginWithEmailAndPasswordError(null);
        setShowFeatureLimitMessage(false);
    }

    function onPasswordChange(password: string) {
        setPassword(password);
        setPasswordError(null);
        setLoginWithEmailAndPasswordError(null);
        setShowFeatureLimitMessage(false);
    }

    // 处理注册链接点击
    function handleSignupClick(e: React.MouseEvent<HTMLAnchorElement>) {
        e.preventDefault();
        setShowFeatureLimitMessage(true);
    }

    // 处理忘记密码链接点击
    function handleForgotPasswordClick(e: React.MouseEvent<HTMLAnchorElement>) {
        e.preventDefault();
        setShowFeatureLimitMessage(true);
    }

    return (
        <div className="max-w-md p-10 bg-white rounded-lg shadow-lg border-gray-200">
            <h2 className="flex justify-center items-center text-2xl font-semibold mb-3 text-gray-700">Welcome back</h2>
            <div className="popup-body">
                <div className=" popup-body-item text-[16px] leading-[1.25em] text-center text-gray-500 w-full whitespace-normal break-words">
                    Please log in to continue.
                </div>
                <div
                    id="g_id_onload"
                    data-client_id="YOUR_GOOGLE_CLIENT_ID"
                    data-context="signin"
                    data-ux_mode="popup"  // 弹窗模式
                    data-callback="handleGoogleSignIn"
                    data-auto_select="true"
                />
                <div className="g_id_signin" data-type="standard" data-shape="rectangular" />
                <button id="loginWithGoogle-btns"
                    className={`w-full h-12 hover:bg-gray-200 border border-gray-300 border-solid bg-white text-black text-base rounded-lg mt-7 mx-0 flex justify-center items-center p-[.5em]`}
                    onClick={handleLoginWithGoogle}>
                    <GoogleIcon className="mr-[5px]" />
                    Continue with Google
                    {isLogingWithGoogle && <CircularProgress sx={{ mt: 0.5, ml: 1 }} size={20} thickness={5} />}
                </button>
                <div className={`${loginWithGoogleError ? '' : 'invisible '}text-red-500 text-sm px-4 py-2 break-words`}>
                    Oops! Login failed, Please try again later, or try log in with email and password.
                </div>
            </div>

            {/* 功能限制提示信息 */}
            <div className={`${showFeatureLimitMessage ? '' : 'hidden'} my-2 p-2 bg-blue-50 text-blue-700 rounded-md text-sm`}>
                {featureLimitMessage}
            </div>

            <div className='my-5'>
                <Divider textAlign="center" >OR</Divider>
            </div>

            <form className="space-y-5" onSubmit={handleLoginWithEmailAndPassword}>
                <EmailInput email={email} onEmailChange={onEmailChange}
                    emailError={emailError} setEmailError={setEmailError} />
                <PasswordInput password={password} onPasswordChange={onPasswordChange}
                    passwordError={passwordError} setPasswordError={setPasswordError} />
                <Link to='/reset-password' className="text-left text-sm text-blue-500 cursor-pointer block" onClick={handleForgotPasswordClick}>
                    Forgot Password?
                </Link>
                <div>
                    <button type='submit'
                        className="flex justify-center items-center w-full h-12 py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-base">
                        Log in
                        <CircularProgress sx={{ color: 'white', ml: 1 }} size={20} thickness={5}
                            className={`${isLogingWithEmailAndPassword ? '' : 'invisible '}`} />
                    </button>
                    <div className={`${loginWithEmailAndPasswordError ? '' : 'invisible '}text-red-500 text-sm px-4 py-2 mt-1`}>{loginWithEmailAndPasswordError}</div>
                    <div className="mt-2 text-center">
                        <span className='text-gray-500 text-sm'>Don't have an account?</span>
                        <Link to="/signup" className="text-sm text-blue-500 hover:text-blue-600 ml-1" onClick={handleSignupClick}>Sign Up</Link>
                    </div>
                </div>
            </form>

            <Footer />
        </div>
    );
}