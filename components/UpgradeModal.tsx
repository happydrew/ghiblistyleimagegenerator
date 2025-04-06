
import { useAuth } from '@/contexts/AuthContext';

// 升级计划模态框组件
const UpgradeModal = ({ onClose }: { onClose: () => void }) => {
    const { user, setIsLoginModalOpen, setLoginModalRedirectTo, getAccessToken } = useAuth();

    return <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70">
        <div className="bg-white p-6 rounded-xl max-w-md border-2 border-[#89aa7b] shadow-xl relative">
            {/* 关闭按钮 */}
            <button
                onClick={onClose}
                className="absolute top-3 right-3 text-[#506a3a] hover:text-[#1c4c3b]"
                title="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-[#e7f0dc] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1c4c3b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#1c4c3b]">
                    {user
                        ? "Your Credits Have Been Used Up"
                        : "You've Used All Your Free Credits"
                    }
                </h3>

                <p className="text-[#506a3a] mb-2">
                    {user
                        ? "You don't have sufficient credits to generate more images. Please upgrade your plan to continue creating stunning Ghibli style images."
                        : "You've used all your free image generations. Please log in and upgrade to a premium plan to continue creating amazing Ghibli style images."
                    }
                </p>

                <p className="text-[#1c4c3b] font-medium mb-6">
                    Premium plans start at just $1!
                </p>

                <div className="flex flex-col w-full space-y-3">
                    {user ? (
                        <button
                            onClick={() => {
                                window.location.href = '/temp-purchase';
                                onClose();
                            }}
                            className="px-4 py-3 bg-[#1c4c3b] text-white rounded-lg hover:bg-[#2a6854] transition w-full flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Upgrade Now
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => {
                                    console.log(`current is in upgrade modal, redirecting to login page, window.location.origin is: ${window.location.origin}`);
                                    setLoginModalRedirectTo(`${window.location.origin}/temp-purchase`)
                                    setIsLoginModalOpen(true); // 打开登录模态框
                                    onClose(); // 关闭升级模态框
                                }}
                                className="px-4 py-3 bg-[#1c4c3b] text-white rounded-lg hover:bg-[#2a6854] transition w-full flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Log In to Continue
                            </button>
                            {/* <p className="text-sm text-[#506a3a] mt-2">
                                    Don't have an account yet? <button onClick={() => window.location.href = '/signup'} className="text-[#1c4c3b] font-medium">Sign up now</button>
                                </p> */}
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>;
}

export default UpgradeModal;