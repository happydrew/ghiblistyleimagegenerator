import { Turnstile } from '@marsidev/react-turnstile';

// cf Turnstile验证模态框组件
const TurnstileModal = ({
    onClose,
    onSuccess,
    onError,
    onExpire
}: {
    onClose: () => void,
    onSuccess: (token: string) => void,
    onError?: () => void,
    onExpire?: () => void
}) => {
    return <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70">
        <div className="bg-white p-6 rounded-xl max-w-md border-2 border-[#89aa7b] shadow-xl relative">
            {/* 关闭按钮 */}
            <button
                onClick={onClose}
                className="absolute top-3 right-3 text-[#506a3a] hover:text-[#1c4c3b]"
                title="Close verification"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="flex flex-col items-center text-center">
                <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Security Verification</h3>
                <p className="text-[#506a3a] mb-4">
                    Please complete the security check to generate your image.
                </p>

                <div className="mb-4">
                    <Turnstile
                        siteKey="0x4AAAAAABDqaLqpWZbP4Ed_"  // 替换为您的实际site key
                        onSuccess={onSuccess}
                        onError={onError}
                        onExpire={onExpire}
                    />
                </div>
            </div>
        </div>
    </div>;
}

export default TurnstileModal;