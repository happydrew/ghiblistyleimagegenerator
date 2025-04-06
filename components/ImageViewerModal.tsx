import { useEffect } from "react";

const ImageViewerModal = ({ image_src, onClose: onClose }: { image_src: string, onClose: () => void }) => {

    const handleESC = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
            window.removeEventListener('keydown', handleESC);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleESC);
        // return () => {
        //     window.removeEventListener('keydown', handleESC);
        // };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80" onClick={onClose}>
            <div className="relative max-w-4xl max-h-[90vh] p-2 bg-white/10 rounded-lg backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                <button
                    className="absolute right-3 top-3 bg-white/30 rounded-full p-2 text-white hover:bg-white/50 transition z-10"
                    onClick={onClose}
                    title="Close image viewer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <img
                    src={image_src}
                    alt="Enlarged Ghibli style image"
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
            </div>
        </div>);
}

export default ImageViewerModal;