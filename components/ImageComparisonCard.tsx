import React, { useState } from "react";
import ImageViewerModal from "./ImageViewerModal";

// 图片比较组件
const ImageComparisonCard = ({
    id,
    data_type,
    original,
    ghibli,
    prompt
}: {
    id?: string,
    data_type?: string,
    original: string,
    ghibli: string,
    prompt?: string
}) => {
    const [selectedImage, setSelectedImage] = useState('');
    const [showImageViewer, setShowImageViewer] = useState(false);

    const handleImageClick = (imageSrc: string) => {
        setSelectedImage(imageSrc);
        setShowImageViewer(true);
    };

    const handleDownload = (original: string, ghibli: string, combined: boolean = false) => {
        // 下载单张图片
        const downloadSingle = async (src: string, filename: string) => {
            let watermark_img = src;
            const img = document.createElement('img');
            img.crossOrigin = 'anonymous';
            img.onload = async () => {
                // 绘制水印
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                ctx.drawImage(img, 0, 0);
                // 添加水印
                ctx!.font = '36px Arial'; // 设置字体和大小
                ctx!.fillStyle = 'rgba(255, 255, 255, 0.8)'; // 设置水印颜色为浅白色
                ctx!.textAlign = 'right'; // 右对齐
                ctx!.fillText('https://GhibliStyleImageGenerator.cc', canvas.width - 12, canvas.height - 12); // 在右下角绘制水印
                // 转换为 Blob 并下载
                watermark_img = canvas.toDataURL('image/jpeg');

                const response = await fetch(watermark_img);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(blobUrl); // 释放内存

                canvas.remove();
                img.remove();
            }
            img.src = src;
        };

        // 如果要下载合并图片
        if (combined) {
            // 创建一个画布来合并图片
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 加载两张图片
            const img_ori = document.createElement('img');
            const img_ghi = document.createElement('img');

            // 创建加载图片的Promise
            img_ori.crossOrigin = 'anonymous'; // 处理跨域问题
            img_ghi.crossOrigin = 'anonymous'; // 处理跨域问题

            // 创建加载图片的Promise
            const loadImage = (img: HTMLImageElement, src: string) => {
                return new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
                    img.src = src;
                });
            };

            Promise.all([
                loadImage(img_ori, original),
                loadImage(img_ghi, ghibli)
            ]).then(() => {
                // 设置画布大小为两张图片并排
                canvas.width = 2 * img_ghi.width;
                canvas.height = img_ghi.height;

                // 绘制两张图片
                ctx!.drawImage(img_ori, 0, 0, img_ghi.width, img_ghi.height);
                ctx!.drawImage(img_ghi, img_ghi.width, 0);

                // 转换为 Blob 并下载
                const base64 = canvas.toDataURL('image/jpeg');
                downloadSingle(base64, 'ghibli-comparison.png');

                canvas.remove();
                img_ori.remove();
                img_ghi.remove();
            }).catch((error) => {
                console.error('Error loading images:', error);
                alert('Failed to load images for download. Please try again.');
            });
        } else {
            // 下载 Ghibli 风格图片
            downloadSingle(ghibli, 'ghibli-style.png');
        }
    };

    const handleShare = async (original: string, ghibli: string) => {
        try {
            // 判断是否支持原生分享API
            if (navigator.share) {
                // 尝试使用原生分享API
                await navigator.share({
                    title: 'My Ghibli Style Image',
                    text: 'Check out this amazing Ghibli style image I created!',
                    url: window.location.href
                });
                return;
            }

            // 如果不支持原生分享，则使用备用方法：复制链接或创建分享图像
            // 创建一个画布来合并图片
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            // 加载两张图片
            const img1 = document.createElement('img');
            const img2 = document.createElement('img');

            img1.crossOrigin = 'anonymous';
            img2.crossOrigin = 'anonymous';

            // 创建加载两张图片的Promise
            const loadImage = (img: HTMLImageElement, src: string) => {
                return new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = reject;
                    img.src = src;
                });
            };

            try {
                // 等待两张图片加载完成
                await Promise.all([
                    loadImage(img1, original),
                    loadImage(img2, ghibli)
                ]);

                // 设置画布大小为两张图片并排
                canvas.width = img1.width + img2.width;
                canvas.height = Math.max(img1.height, img2.height);

                // 绘制两张图片
                ctx.drawImage(img1, 0, 0);
                ctx.drawImage(img2, img1.width, 0);

                // 将合并后的图片转换为Blob
                const blob = await new Promise<Blob | null>((resolve) => {
                    canvas.toBlob(resolve, 'image/png');
                });

                if (!blob) {
                    throw new Error('Failed to create image blob');
                }

                // 尝试使用剪贴板API复制图片
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            [blob.type]: blob
                        })
                    ]);
                    alert('Image copied to clipboard! Now you can paste it in your applications.');
                } catch (clipboardError) {
                    // 如果剪贴板API失败，提供下载选项
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'ghibli-comparison.png';
                    link.click();

                    URL.revokeObjectURL(url);
                    alert('Image downloaded successfully! You can now share it manually.');
                }
            } catch (imageError) {
                console.error('Error loading images:', imageError);
                // 如果加载图片失败，提供复制URL作为后备选项
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    alert('Website URL copied to clipboard. You can share it with others!');
                } catch (urlError) {
                    alert('Could not share image. Please try downloading it and sharing manually.');
                }
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert('Failed to share. Please try downloading and sharing manually.');
        }
    };


    return (
        <div>
            {/* 添加图片查看器模态框 */}
            {showImageViewer && <ImageViewerModal image_src={selectedImage} onClose={() => setShowImageViewer(false)} />}

            <div {...(id && { id })} {...(data_type && { "data-type": data_type })} className="bg-white rounded-xl overflow-hidden shadow-lg border border-[#89aa7b] mb-8">
                <div className="p-4 bg-[#e7f0dc] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-[#1c4c3b]">Style Transformation</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleShare(original, ghibli)}
                            className="p-2 bg-[#1c4c3b] text-white rounded-full hover:bg-[#2a6854] transition"
                            title="Share"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                        <div className="relative group">
                            <button
                                className="p-2 bg-[#1c4c3b] text-white rounded-full hover:bg-[#2a6854] transition"
                                title="Download"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </button>
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <div className="py-2 px-1">
                                    <button
                                        onClick={() => handleDownload(original, ghibli, false)}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#e7f0dc] w-full text-left rounded"
                                    >
                                        Download Ghibli Image
                                    </button>
                                    <button
                                        onClick={() => handleDownload(original, ghibli, true)}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#e7f0dc] w-full text-left rounded"
                                    >
                                        Download Comparison
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 border-r border-[#e7f0dc]">
                        <div className="relative pt-[100%]">
                            <img
                                src={original}
                                alt="Original image"
                                className="absolute top-0 left-0 w-full h-full object-contain cursor-pointer"
                                onClick={() => handleImageClick(original)}
                            />
                        </div>
                        <div className="p-2 text-center bg-[#f5f9ee]">
                            <p className="text-[#506a3a] font-medium">Original</p>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2">
                        <div className="relative pt-[100%]">
                            <img
                                src={ghibli}
                                alt="Ghibli style image"
                                className="absolute top-0 left-0 w-full h-full object-contain cursor-pointer"
                                onClick={() => handleImageClick(ghibli)}
                            />
                        </div>
                        <div className="p-2 text-center bg-[#f5f9ee]">
                            <p className="text-[#506a3a] font-medium">Stylized</p>
                        </div>
                    </div>
                </div>
                {prompt && (
                    <div className="p-3 bg-[#f8fbf3] border-t border-[#e7f0dc]">
                        <p className="text-sm text-[#506a3a]"><span className="font-medium">Prompt:</span> {prompt}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageComparisonCard;