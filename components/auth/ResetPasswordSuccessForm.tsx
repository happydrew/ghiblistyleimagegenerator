import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";

// 完整的登录页面
export default function ResetPasswordSuccessForm(): React.ReactNode {
    const navigate = useNavigate();

    useEffect(() => {
        // 等待2秒钟，然后跳转到登录页面
        setTimeout(() => {
            navigate('/');
        }, 3000);
    }, []);

    return (
        <div className="max-w-md p-10 bg-white rounded-lg shadow-lg border-solid border-[1px] border-gray-200">
            <h2 className="flex justify-center items-center text-2xl font-semibold mb-3 text-gray-700">
                <CheckCircleIcon sx={{ fontSize: 50, color: 'green' }} />
                Congratulations! You have reset your password successfully.
            </h2>
            <div className=" popup-body-item text-[16px] leading-[1.25em] text-center text-gray-500 w-full whitespace-normal break-words">
                Redirecting to login page in 3 seconds...
            </div>
        </div>
    );
}