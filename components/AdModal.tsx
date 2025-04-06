// 广告组件
const AdModal = ({ message, onClose, onAdClick }: {
    message: string,
    onClose: () => void,
    onAdClick: () => void
}) => (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70">
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#1c4c3b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#1c4c3b]">Support Our Service</h3>

                <p className="text-[#506a3a] mb-6">
                    {message}
                </p>

                <div className="flex flex-col w-full space-y-3">
                    <button
                        onClick={onAdClick}
                        className="px-4 py-3 bg-[#1c4c3b] text-white rounded-lg hover:bg-[#2a6854] transition w-full flex items-center justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                        View Ad
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default AdModal;