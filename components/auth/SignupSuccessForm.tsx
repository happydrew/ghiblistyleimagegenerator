import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { loginWithEmailAndPassword } from "@lib/auth";

// 完整的登录页面
export default function SignupSuccessForm(): React.ReactNode {
    const navigate = useNavigate();
    const { email, password } = useLocation().state || {};
    const [notification, setNotification] = useState('Logging in, please wait......');

    useEffect(() => {
        if (!email || !password) {
            navigate('/signup');
            return;
        }
        // 等待2秒钟，然后自动登录
        setTimeout(() => {
            // 登录
            loginWithEmailAndPassword(email, password).then(({ user, errorCode }) => {
                if (errorCode) {
                    throw new Error(`login failed with error code ${errorCode}`);
                } else {
                    setNotification('Login success, redirecting to home page......');
                    // 登录成功，跳转到首页
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                }
            }).catch((e) => {
                console.error('login after verify failed', e);
                setNotification('Login failed, please try again later.');
                // 登录失败，跳转到登录页面
                navigate('/login');
            });
        }, 2000);
    }, []);

    return (
        <div className="w-full flex justify-center items-center p-6 md:p-10 bg-white">
            <div className="max-w-md p-10 rounded-lg shadow-lg border-solid border-[1px] border-gray-200">
                <h2 className="flex justify-center items-center text-2xl font-semibold mb-3 text-gray-700">
                    <CheckCircleIcon sx={{ fontSize: 50, color: 'green' }} />
                    Congratulations! You have registered successfully.
                </h2>
                <div className=" popup-body-item text-[16px] leading-[1.25em] text-center text-gray-500 w-full whitespace-normal break-words">
                    {notification}
                </div>
            </div>
        </div>
    );
}