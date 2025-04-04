import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Turnstile } from '@marsidev/react-turnstile';
import { checkFreeUsage, useOneFreeGeneration } from '@lib/usageChecker';
// 修正导入
import { useAuth } from '@/contexts/AuthContext';
// 移除 HashRouter 相关导入
// import { HashRouter } from "react-router-dom";

// 定义历史记录类型
interface HistoryItem {
    originalImage: string;
    ghibliImage: string;
    timestamp: number;
    prompt?: string;
}

const MAX_FREE = 3;

const HomePage = () => {
    // 使用AuthContext
    const { user, credits, setIsLoginModalOpen, setLoginModalRedirectTo, getAccessToken } = useAuth();

    const [prompt, setPrompt] = useState('');
    const [selectedImage, setSelectedImage] = useState('');
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generationError, setGenerationError] = useState('');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // 新增状态控制广告显示
    const [showPreGenAd, setShowPreGenAd] = useState(false);
    const [showPostGenAd, setShowPostGenAd] = useState(false);
    const [isResultBlurred, setIsResultBlurred] = useState(false);
    const [pendingGeneration, setPendingGeneration] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string>('');
    const [showTurnstile, setShowTurnstile] = useState(false);
    const [freeCredits, setFreeCredits] = useState(0);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // 示例提示词
    const examplePrompts = [
        "A small countryside town in Ghibli style, sunset, with a winding path leading to a castle in the distance",
        "Transform a portrait into a Ghibli-style character, focusing on details and whimsy",
        "A magical forest with spirits and soft glowing lights in Miyazaki style",
        "An oceanic scene with flying machines and fluffy clouds in Ghibli aesthetic"
    ];

    // 只在用户未登录时才检查免费使用次数
    useEffect(() => {
        if (!user) {
            checkFreeUsage().then((freeUsage) => {
                console.log('Free usage:', freeUsage);
                setFreeCredits(MAX_FREE - freeUsage);
            }).catch((error) => {
                console.error('Failed to check usage:', error);
                setFreeCredits(MAX_FREE);
            });
        }
    }, [user]);

    // 加载历史记录
    useEffect(() => {
        const savedHistory = localStorage.getItem('ghibliImageHistory');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Failed to parse history:', e);
            }
        }
    }, []);

    // 保存历史记录
    useEffect(() => {
        if (history.length > 0) {
            let saveSuccess = false;
            while (!saveSuccess) {
                try {
                    localStorage.setItem('ghibliImageHistory', JSON.stringify(history));
                    saveSuccess = true;
                } catch (e) {
                    console.error('Failed to save history,exceed the quota:', e);
                    history.shift(); // 移除最早的记录
                }
            }
        }
    }, [history]);

    const handleRandomPrompt = () => {
        const randomIndex = Math.floor(Math.random() * examplePrompts.length);
        setPrompt(examplePrompts[randomIndex]);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // 检查文件大小 (限制为 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const img = document.createElement('img');
                img.crossOrigin = 'anonymous'; // 处理跨域问题
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    // 检查宽度并按比例调整高度
                    if (width > 1024) {
                        height = Math.round((height * 1024) / width);
                        width = 1024;
                    }

                    // 创建一个 canvas 来绘制压缩后的图像
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        // 转换为 WebP 格式
                        const webpImage = canvas.toDataURL('image/webp');
                        // 存储压缩后的 base64 字符串用于显示
                        setUploadedImage(webpImage);
                        // 清除之前生成的图片
                        setGeneratedImage(null);
                    }
                    canvas.remove();
                    img.remove();
                };
                img.src = event.target.result as string;
            }
        };
        reader.readAsDataURL(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleTurnstileSuccess = (token: string) => {
        setTurnstileToken(token);
        if (token) {
            executeGeneration(token);
        }
    };

    const handleGenerateClick = async () => {

        if (!uploadedImage) {
            alert('Please upload an image first');
            return;
        }

        // 根据登录状态决定走哪个逻辑
        if ((!user && freeCredits <= 0) || (user && credits <= 0)) {
            // 未登录用户且免费额度已用完，或者已登录用户且账户额度已用完，弹出升级提示
            setShowUpgradeModal(true);
            return;
        }

        // executeGeneration("");

        // 还有点数的用户可以继续生成
        setShowTurnstile(true);
        setPendingGeneration(true);
    };

    const executeGeneration = async (token: string) => {
        if (!uploadedImage) return;

        setIsGenerating(true);
        setGenerationError('');
        setShowTurnstile(false);

        // useOnce();
        // setIsGenerating(false);
        // setPendingGeneration(false);
        // return;

        try {
            const base64WithoutPrefix = uploadedImage!.split(',')[1];

            const accessToken = await getAccessToken();

            const response = await fetch('/api/generate-ghibli', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image: base64WithoutPrefix,
                    turnstileToken: token,
                    accessToken
                })
            });

            if (response.ok) {
                const responseData = await response.json();
                // 确保使用正确的属性路径获取图片数据
                const ghibliImage = responseData.ghibliImage;
                setIsGenerating(false);
                setGeneratedImage(ghibliImage);
                const img = document.createElement('img');
                img.crossOrigin = 'anonymous'; // 处理跨域问题
                img.onload = () => {
                    // 转换为 WebP 格式
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, img.width, img.height);
                        // 转换为 WebP 格式
                        const img_base64 = canvas.toDataURL('image/jpeg');
                        setGeneratedImage(img_base64);
                        addToHistory(uploadedImage, img_base64);
                    }
                    canvas.remove();
                    img.remove();
                }
                img.src = ghibliImage;

                useOnce();

                // 设置模糊效果并显示生成后广告
                // setIsResultBlurred(true);
                // setShowPostGenAd(true);
            } else {
                setGenerationError('Failed to generate image. Please try again.');
            }
        } catch (error) {
            console.error('Error generating image:', error);
            setGenerationError('An error occurred. Please try again later.');
        } finally {
            setIsGenerating(false);
            setPendingGeneration(false);
        }


        // 显示生成前广告
        // setShowPreGenAd(true);
        // setPendingGeneration(true);
    };

    const useOnce = () => {
        // 根据登录状态决定扣减哪个系统的点数
        if (!user) {
            // 未登录用户，扣减免费点数
            setFreeCredits(prev => prev - 1);
            useOneFreeGeneration();
        } else {
            // 已登录用户，扣减账户点数（此功能稍后实现）
            console.log('Deducting points from user account - to be implemented');
            // 这里未来会调用扣减用户账户点数的API
        }
    }

    // 修改处理广告的函数
    const handleCloseAd = (isPreGenAd: boolean) => {
        if (isPreGenAd) {
            setShowPreGenAd(false);
            setPendingGeneration(false);
        } else {
            setShowPostGenAd(false);
            // 不移除模糊效果，因为用户没有查看广告
        }
    };

    const handleAdClick = async (isPreGenAd: boolean) => {
        // 这里可以添加实际的广告跳转逻辑
        const currentWindow = window
        const newTab = window.open('https://povaique.top/4/9150862', '_blank', 'noopener noreferrer');
        if (newTab) {
            newTab.blur();
            currentWindow.focus();
        }

        if (isPreGenAd) {
            // 关闭生成前广告
            setShowPreGenAd(false);
            setPendingGeneration(false);

            // 开始生成过程
            setIsGenerating(true);
            setGenerationError('');

            try {
                // 移除 base64 字符串的前缀部分
                const base64WithoutPrefix = uploadedImage!.split(',')[1];

                // 调用后端API生成图片
                const response = await fetch('/api/generate-ghibli', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        image: base64WithoutPrefix,
                    })
                });

                if (response.ok) {
                    const responseData = await response.json();
                    // 确保使用正确的属性路径获取图片数据
                    const ghibliImage = responseData.ghibliImage;
                    setIsGenerating(false);
                    setGeneratedImage(ghibliImage);
                    const img = document.createElement('img');
                    img.crossOrigin = 'anonymous'; // 处理跨域问题
                    img.onload = () => {
                        // 转换为 WebP 格式
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(img, 0, 0, img.width, img.height);
                            // 转换为 WebP 格式
                            const img_base64 = canvas.toDataURL('image/jpeg');
                            setGeneratedImage(img_base64);
                        }
                        canvas.remove();
                        img.remove();
                    }
                    img.src = ghibliImage;

                    // 设置模糊效果并显示生成后广告
                    setIsResultBlurred(true);
                    setShowPostGenAd(true);
                } else {
                    setGenerationError('Failed to generate image. Please try again.');
                }
            } catch (error) {
                console.error('Error generating image:', error);
                setGenerationError('An error occurred. Please try again later.');
            } finally {
                setIsGenerating(false);
            }
        } else {
            // 关闭生成后广告并移除模糊效果
            setShowPostGenAd(false);
            setIsResultBlurred(false);
            addToHistory(uploadedImage, generatedImage);
        }
    };

    const addToHistory = (originalImage: string, ghibliImage: string) => {
        // 添加到历史记录
        const newHistoryItem: HistoryItem = {
            originalImage: originalImage,
            ghibliImage: ghibliImage,
            timestamp: Date.now(),
        };

        setHistory(prev => [newHistoryItem, ...prev]);
    }

    const handleImageClick = (imageSrc: string) => {
        setSelectedImage(imageSrc);
        setShowImageViewer(true);
        window.addEventListener('keydown', handleESC);
    };

    const handleESC = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setShowImageViewer(false);
            window.removeEventListener('keydown', handleESC);
        }
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

    // 清除历史记录
    const clearHistory = () => {
        if (confirm('Are you sure you want to clear all history?')) {
            setHistory([]);
            localStorage.removeItem('ghibliImageHistory');
        }
    };

    // 图片比较组件
    const ImageComparisonCard = ({ id, data_type, original, ghibli, prompt }: { id?: string, data_type?: string, original: string, ghibli: string, prompt?: string }) => (
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
    );

    // 广告组件
    const AdModal = ({ isPreGenAd = true, onClose, onAdClick }: {
        isPreGenAd?: boolean,
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
                        {isPreGenAd
                            ? "To generate Ghibli images, please view a quick ad. This helps us cover AI costs and keep our tool free for everyone. Thank you for your support!"
                            : "Your image is ready! Please view a quick ad to reveal it. Your support helps keep our AI service free and accessible."}
                    </p>

                    <div className="flex flex-col w-full space-y-3">
                        <button
                            onClick={onAdClick}
                            className="px-4 py-3 bg-[#1c4c3b] text-white rounded-lg hover:bg-[#2a6854] transition w-full flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                            {isPreGenAd ? 'View Ad to Continue' : 'View Ad to Reveal Image'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // 升级计划模态框组件
    const UpgradeModal = () => (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70">
            <div className="bg-white p-6 rounded-xl max-w-md border-2 border-[#89aa7b] shadow-xl relative">
                {/* 关闭按钮 */}
                <button
                    onClick={() => setShowUpgradeModal(false)}
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
                                    setShowUpgradeModal(false);
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
                                        setShowUpgradeModal(false); // 关闭升级模态框
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
        </div>
    );

    return (
        <div className="min-h-screen bg-white">

            {/* 添加升级计划提示框 */}
            {showUpgradeModal && <UpgradeModal />}

            {/* 添加广告模态框 */}
            {showPreGenAd && (
                <AdModal
                    isPreGenAd={true}
                    onClose={() => handleCloseAd(true)}
                    onAdClick={() => handleAdClick(true)}
                />
            )}

            {showPostGenAd && (
                <AdModal
                    isPreGenAd={false}
                    onClose={() => handleCloseAd(false)}
                    onAdClick={() => handleAdClick(false)}
                />
            )}

            {/* 添加图片查看器模态框 */}
            {showImageViewer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80" onClick={() => setShowImageViewer(false)}>
                    <div className="relative max-w-4xl max-h-[90vh] p-2 bg-white/10 rounded-lg backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="absolute right-3 top-3 bg-white/30 rounded-full p-2 text-white hover:bg-white/50 transition z-10"
                            onClick={() => setShowImageViewer(false)}
                            title="Close image viewer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={selectedImage}
                            alt="Enlarged Ghibli style image"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}

            {/* Turnstile验证模态框 */}
            {showTurnstile && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70">
                    <div className="bg-white p-6 rounded-xl max-w-md border-2 border-[#89aa7b] shadow-xl relative">
                        {/* 关闭按钮 */}
                        <button
                            onClick={() => {
                                setShowTurnstile(false);
                                setPendingGeneration(false);
                            }}
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
                                    onSuccess={handleTurnstileSuccess}
                                    onError={() => setTurnstileToken('')}
                                    onExpire={() => setTurnstileToken('')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="pt-8">
                {/* 英雄区域 */}
                <div id="hero_containter" className='w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12'>
                    {/* <div data-banner-id="1444036"></div> */}
                    <section className="w-full md:max-w-auto container mx-auto px-4 py-8 text-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#1c4c3b]">Image Stylify</h1>
                        <p className="text-xl md:text-2xl text-[#506a3a] mb-6 max-w-3xl mx-auto">
                            Transform your photos into stunning artistic styles in seconds
                        </p>
                        <p className="text-md text-[#506a3a] mb-12 max-w-3xl mx-auto">
                            Powered by GPT-4o technology | Multiple styles including Ghibli, Anime, Watercolor and more
                        </p>
                        <div className="bg-[#e7f0dc] p-6 rounded-xl max-w-4xl mx-auto shadow-lg border border-[#89aa7b]">
                            <h2 className="text-2xl font-bold mb-6 text-[#1c4c3b]">AI-Powered Style Transfer</h2>

                            {/* 上传图片区域 */}
                            <div className="mb-6">
                                <div className="p-4 border-2 border-dashed border-[#89aa7b] rounded-lg bg-white/90 text-center cursor-pointer" onClick={triggerFileInput}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        title="Upload image"
                                        aria-label="Upload image"
                                    />

                                    {uploadedImage ? (
                                        <div className="relative max-h-64 overflow-hidden">
                                            <img
                                                src={uploadedImage}
                                                alt="Uploaded image"
                                                className="mx-auto max-h-64 object-contain"
                                            />
                                            <div className="absolute bottom-0 right-0 m-2">
                                                <button
                                                    className="bg-white/80 p-1 rounded-full text-[#1c4c3b] hover:bg-white transition"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setUploadedImage(null);
                                                    }}
                                                    title="Remove uploaded image"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#89aa7b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="mt-4 text-[#506a3a]">Click to upload an image or drag & drop</p>
                                            <p className="text-sm text-[#506a3a] mt-1">PNG, JPG, WEBP up to 5MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 按钮区域 */}
                            <div className="flex flex-col justify-center mb-6 gap-2">
                                <button
                                    className={`w-auto px-6 py-3 bg-[#1c4c3b] text-white text-lg rounded-lg hover:bg-[#2a6854] transition ${isGenerating || !uploadedImage || pendingGeneration ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    onClick={handleGenerateClick}
                                    disabled={isGenerating || !uploadedImage || pendingGeneration}
                                >
                                    {isGenerating ? 'Generating...' : pendingGeneration ? 'Verifying...' : 'Transform Your Image'}
                                </button>

                                {/* 只在未登录状态下显示免费点数提示 */}
                                {!user && (
                                    <p className="ml-4 text-sm text-[#506a3a]">Remaining Free Credits: {freeCredits} &nbsp;&nbsp;
                                        <button
                                            onClick={() => {
                                                console.log(`clicking  Add Credits button, current window.location.origin is: ${window.location.origin}`);
                                                setLoginModalRedirectTo(`${window.location.origin}/temp-purchase`)
                                                setIsLoginModalOpen(true); // 打开登录模态框
                                            }}
                                            className="text-[#1c4c3b] font-medium underline"
                                        >
                                            Add Credits
                                        </button>
                                    </p>
                                )}

                                {/* 已登录用户不在这里显示点数信息，因为右上角的用户信息区已经有用户点数信息了 */}
                            </div>

                            <p className="text-sm text-[#506a3a] mt-4">
                                Powered by <span className="font-semibold">GPT-4o technology</span> | Fast, accurate style transformation
                            </p>
                        </div>
                    </section>
                    {/* <div data-banner-id="1444051"></div> */}
                </div>


                {/* 生成结果区域 */}
                {(isGenerating || generatedImage || generationError) && (
                    <section className="container mx-auto px-4 py-8">
                        <h2 className="text-2xl font-bold mb-6 text-center text-[#1c4c3b]">Your Style Transformation</h2>

                        {isGenerating && (
                            <div className="flex justify-center items-center p-12">
                                <div className="relative inline-flex">
                                    <div className="w-16 h-16 border-4 border-[#e7f0dc] border-t-[#1c4c3b] rounded-full animate-spin"></div>
                                    <span className="sr-only">Loading...</span>
                                </div>
                                <p className="ml-4 text-lg text-[#1c4c3b]">Creating Ghibli magic...</p>
                            </div>
                        )}

                        {generationError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center text-red-700 mb-6">
                                {generationError}
                            </div>
                        )}

                        {generatedImage && uploadedImage && !isGenerating && (
                            <div className="max-w-4xl mx-auto relative">
                                {/* 添加模糊效果覆盖层 */}
                                {isResultBlurred && (
                                    <div className="absolute inset-0 backdrop-blur-md z-10 flex flex-col items-center justify-center gap-2">
                                        <div className="p-4 bg-white/70 rounded-lg shadow-lg">
                                            <p className="text-lg font-medium text-[#1c4c3b]">Your image is ready!</p>
                                        </div>
                                        <button
                                            className="bg-[#1c4c3b] text-white p-3 stext-sm rounded-lg hover:bg-[#2a6854] transition"
                                            onClick={() => setShowPostGenAd(true)}
                                        >
                                            Reveal Your Ghibli Image
                                        </button>
                                    </div>
                                )}
                                <ImageComparisonCard
                                    id="generated-image-comparison-card"
                                    data-type="generated-image-comparison-card"
                                    original={uploadedImage}
                                    ghibli={generatedImage}
                                />
                            </div>
                        )}
                    </section>
                )}

                {/* 历史记录区域 */}
                {history.length > 0 && (
                    <section className="container mx-auto px-4 py-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-[#1c4c3b]">Your Ghibli Gallery</h2>
                            <button
                                onClick={clearHistory}
                                className="px-3 py-1 text-sm border border-[#89aa7b] rounded-lg hover:bg-[#d5e6c3] transition text-[#506a3a]"
                            >
                                Clear History
                            </button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {history.map((item, index) => (
                                <ImageComparisonCard
                                    key={index}
                                    original={item.originalImage}
                                    ghibli={item.ghibliImage}
                                    prompt={item.prompt}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* 添加关于Ghibli风格的介绍部分 */}
                <section id="about" className="container mx-auto px-4 py-16">
                    <h2 className="text-3xl font-bold mb-8 text-center text-[#1c4c3b]">Exploring the Magic of Artistic Transformations</h2>
                    <p className="text-lg text-[#506a3a] mb-10 text-center max-w-3xl mx-auto">
                        Discover various artistic styles including the dreamlike aesthetics of Studio Ghibli and many more
                    </p>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-bold mb-4 text-[#1c4c3b]">Transform Your Photos with AI</h3>
                            <p className="text-[#506a3a] mb-4">
                                Our Image Stylify tool lets you convert your ordinary photos into artistic masterpieces with various style options including the popular Ghibli style, characterized by soft colors, delicate lines, and dreamlike settings.
                            </p>
                            <p className="text-[#506a3a] mb-4">
                                With the latest advancements in GPT-4o technology, artistic style transfer has become a sensation on the internet, with millions of users transforming their photos into enchanting visuals.
                            </p>
                            <p className="text-[#506a3a]">
                                Even industry leaders like OpenAI's CEO Sam Altman have showcased the technology's capabilities by sharing stylized self-portraits, highlighting the growing popularity of AI-powered artistic transformations.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                            <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Popular Style Characteristics:</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <span className="w-5 h-5 bg-[#e7f0dc] rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="w-2 h-2 bg-[#1c4c3b] rounded-full"></span>
                                    </span>
                                    <span className="text-[#506a3a]">Studio Ghibli style: Soft and warm color palettes that evoke nostalgia</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-5 h-5 bg-[#e7f0dc] rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="w-2 h-2 bg-[#1c4c3b] rounded-full"></span>
                                    </span>
                                    <span className="text-[#506a3a]">Anime style: Delicate and intricate line designs with careful attention to detail</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-5 h-5 bg-[#e7f0dc] rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="w-2 h-2 bg-[#1c4c3b] rounded-full"></span>
                                    </span>
                                    <span className="text-[#506a3a]">Fantasy style: Dreamlike settings and ethereal lighting effects</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-5 h-5 bg-[#e7f0dc] rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="w-2 h-2 bg-[#1c4c3b] rounded-full"></span>
                                    </span>
                                    <span className="text-[#506a3a]">Character style: Unique designs with expressive features</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-5 h-5 bg-[#e7f0dc] rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="w-2 h-2 bg-[#1c4c3b] rounded-full"></span>
                                    </span>
                                    <span className="text-[#506a3a]">Artistic blend: Perfect combination of realism and fantasy in cohesive styles</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 改进灵感区域，包含更多prompt指南 */}
                <section id="examples" className="container mx-auto px-4 py-16">
                    <h2 className="text-3xl font-bold mb-8 text-center text-[#1c4c3b]">Style Transformation Gallery</h2>
                    <p className="text-xl text-[#506a3a] mb-10 text-center">
                        See what others have created with our style transformation tools
                    </p>

                    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 mb-12 space-y-4">
                        {[...Array(12)].map((_, index) => (
                            <div
                                key={index}
                                className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer border border-[#89aa7b] break-inside-avoid mb-4 inline-block w-full"
                                onClick={() => handleImageClick(`/examples/${index + 1}.png`)}
                            >
                                <img
                                    src={`/examples/${index + 1}.png`}
                                    alt={`Ghibli style AI image example ${index + 1}`}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b] mb-10">
                        <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Best Style Prompts</h3>
                        <p className="text-[#506a3a] mb-4">
                            Based on user experiences, here are some effective prompts for different artistic styles:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-[#f8fbf3] p-3 rounded-lg border border-[#d5e6c3]">
                                <p className="text-[#506a3a] italic">"Transform this photo into a Ghibli-style scene with soft watercolors and dreamlike elements."</p>
                            </div>
                            <div className="bg-[#f8fbf3] p-3 rounded-lg border border-[#d5e6c3]">
                                <p className="text-[#506a3a] italic">"Convert my image into a hand-drawn animation style with watercolor techniques and soft organic lines."</p>
                            </div>
                            <div className="bg-[#f8fbf3] p-3 rounded-lg border border-[#d5e6c3]">
                                <p className="text-[#506a3a] italic">"Create a dreamy landscape with magical elements and a warm color palette."</p>
                            </div>
                            <div className="bg-[#f8fbf3] p-3 rounded-lg border border-[#d5e6c3]">
                                <p className="text-[#506a3a] italic">"Stylize this photo while maintaining the original composition and adding magical, dreamy aesthetics."</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <h3 className="text-2xl font-bold mb-4 text-[#1c4c3b]">How to Transform Your Images?</h3>
                        <p className="text-lg text-[#506a3a] mb-6 max-w-3xl mx-auto">
                            Our platform makes it simple to transform your images into artistic styles with just a few clicks
                        </p>

                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="bg-white p-5 rounded-xl shadow-md border border-[#89aa7b]">
                                <div className="w-12 h-12 bg-[#e7f0dc] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-xl font-bold text-[#1c4c3b]">1</span>
                                </div>
                                <h4 className="font-bold text-[#1c4c3b] mb-2">Enter Your Prompt</h4>
                                <p className="text-[#506a3a] text-sm">
                                    Describe what you want or use our style prompt examples
                                </p>
                            </div>

                            <div className="bg-white p-5 rounded-xl shadow-md border border-[#89aa7b]">
                                <div className="w-12 h-12 bg-[#e7f0dc] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-xl font-bold text-[#1c4c3b]">2</span>
                                </div>
                                <h4 className="font-bold text-[#1c4c3b] mb-2">Customize Settings</h4>
                                <p className="text-[#506a3a] text-sm">
                                    Adjust style parameters to match your vision perfectly
                                </p>
                            </div>

                            <div className="bg-white p-5 rounded-xl shadow-md border border-[#89aa7b]">
                                <div className="w-12 h-12 bg-[#e7f0dc] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-xl font-bold text-[#1c4c3b]">3</span>
                                </div>
                                <h4 className="font-bold text-[#1c4c3b] mb-2">Generate & Download</h4>
                                <p className="text-[#506a3a] text-sm">
                                    Get your artistic style masterpiece instantly
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 补充功能区域 */}
                <section id="features" className="bg-[#e7f0dc] py-16">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold mb-8 text-center text-[#1c4c3b]">Key Features of Our Image Transformation Tool</h2>
                        <p className="text-xl text-[#506a3a] mb-16 text-center max-w-3xl mx-auto">
                            Experience next-generation AI image generator technology - powerful, free, and privacy-focused
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                                <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Advanced AI Technology</h3>
                                <p className="text-[#506a3a]">
                                    Powered by GPT-4o's cutting-edge algorithms that perfectly capture Ghibli's unique artistic style, color palettes, and dreamlike aesthetics.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                                <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">State-of-the-Art Quality</h3>
                                <p className="text-[#506a3a]">
                                    Our ghibli photo generator creates images with exceptional detail and artistic style control, rivaling professional illustrations.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                                <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Advanced Prompt Technology</h3>
                                <p className="text-[#506a3a]">
                                    Our advanced prompt system accurately interprets complex text descriptions and provides impressive results every time.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                                <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Lightning-Fast Generation</h3>
                                <p className="text-[#506a3a]">
                                    Optimized inference pipeline ensures you can create ghibli style masterpieces in seconds without compromising on quality.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                                <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Enhanced Privacy</h3>
                                <p className="text-[#506a3a]">
                                    Zero data retention policy - your prompts and generated images are never stored on our servers, ensuring complete confidentiality.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                                <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Multi-Style Support</h3>
                                <p className="text-[#506a3a]">
                                    Choose from various artistic styles including Ghibli, anime, watercolor, oil painting, and more. Each style is carefully crafted to maintain the essence of your original image.
                                </p>
                            </div>
                        </div>
                        {/* 添加使用场景部分 */}
                        <div className="mt-16">
                            <h3 className="text-2xl font-bold mb-8 text-center text-[#1c4c3b]">Application Scenarios</h3>
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                                    <h4 className="text-xl font-bold mb-4 text-[#1c4c3b]">Social Media Profiles</h4>
                                    <p className="text-[#506a3a]">
                                        Stand out with unique ghibli portraits as profile pictures. According to data, anime-style avatars are extremely popular, with 72% of people regularly engaging with anime content.
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                                    <h4 className="text-xl font-bold mb-4 text-[#1c4c3b]">Creative Design Projects</h4>
                                    <p className="text-[#506a3a]">
                                        Professional designers use our generator for poster designs, art portfolios, website elements, and printed merchandise with the distinctive Ghibli aesthetic.
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                                    <h4 className="text-xl font-bold mb-4 text-[#1c4c3b]">Brand Marketing</h4>
                                    <p className="text-[#506a3a]">
                                        Many brands now use Ghibli-style images for marketing promotions, effectively boosting brand recognition and user engagement with a touch of nostalgic magic.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 更新FAQ部分 */}
                <section id="faq" className="container mx-auto px-4 py-16">
                    <h2 className="text-3xl font-bold mb-8 text-center text-[#1c4c3b]">Frequently Asked Questions</h2>
                    <p className="text-xl text-[#506a3a] mb-16 text-center">
                        Have other questions? Contact us at zhugetd@gmail.com
                    </p>

                    <div className="max-w-3xl mx-auto space-y-6">
                        {[
                            {
                                question: 'What is Image Stylify and how does it work?',
                                answer: 'Image Stylify is an AI-powered tool that transforms your photos into various artistic styles including the popular Studio Ghibli aesthetic. Powered by GPT-4o technology, it allows you to create high-quality artistic transformations from your uploaded images, with no registration required for basic usage.'
                            },
                            {
                                question: 'What styles are available for image transformation?',
                                answer: 'Our platform offers multiple artistic styles including Studio Ghibli, anime, watercolor, oil painting, sketch, and more. The Ghibli style is particularly popular for its dreamlike qualities, soft colors, and distinctive aesthetic inspired by the renowned animation studio.'
                            },
                            {
                                question: 'Is your style transformation tool free to use?',
                                answer: 'Yes, our basic style transformation tool is completely free to use! We also offer premium options with higher resolution outputs, batch processing, and additional customization features for professional users.'
                            },
                            {
                                question: 'How is GPT-4o Ghibli style different from other AI tools?',
                                answer: 'GPT-4o\'s Ghibli-style generation is based on more advanced understanding capabilities, allowing it to better grasp the essence of Ghibli art rather than just applying surface filters. This results in generated images with higher artistic quality and consistency compared to other available tools.'
                            },
                            {
                                question: 'Can I use OpenAI Studio Ghibli functionality for photos with multiple people?',
                                answer: 'Yes, our system supports processing photos with multiple people, preserving each person\'s unique features while infusing them with Ghibli\'s artistic style. This makes it perfect for family photos or group pictures.'
                            },
                            {
                                question: 'How do you address copyright concerns with ghibli art GPT-4o?',
                                answer: 'Our service creates original artwork inspired by animation art styles without directly copying specific copyrighted characters, scenes, or designs. We use AI algorithms trained on diverse artistic techniques to transform your images into stylized artwork that evokes the aesthetic qualities of traditional animation. We encourage users to use generated images responsibly and in compliance with applicable copyright laws. Please review our Terms of Service for detailed usage guidelines.'
                            },
                            {
                                question: 'How is your style transfer different from other tools?',
                                answer: 'Our platform uses GPT-4o\'s advanced understanding capabilities to grasp the essence of artistic styles rather than just applying surface filters. This results in transformed images with higher artistic quality and consistency compared to other available tools.'
                            }
                        ].map((faq, index) => (
                            <div key={index} className="border border-[#89aa7b] rounded-lg p-6 bg-white">
                                <h3 className="text-xl font-bold mb-4 flex items-center text-[#1c4c3b]">
                                    <span className="flex items-center justify-center w-8 h-8 bg-[#1c4c3b] text-white rounded-full mr-4">
                                        {index + 1}
                                    </span>
                                    {faq.question}
                                </h3>
                                <p className="text-[#506a3a] ml-12">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 添加对比分析部分 */}
                <section className="bg-[#e7f0dc] py-16">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold mb-8 text-center text-[#1c4c3b]">How We Compare</h2>
                        <p className="text-xl text-[#506a3a] mb-16 text-center max-w-3xl mx-auto">
                            See how our style transformation tool compares to other tools in the market
                        </p>

                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white text-black rounded-xl shadow-md border border-[#89aa7b]">
                                <thead>
                                    <tr className="bg-[#1c4c3b] text-white">
                                        <th className="py-3 px-4 text-left">Tool Name</th>
                                        <th className="py-3 px-4 text-left">Price</th>
                                        <th className="py-3 px-4 text-left">Speed</th>
                                        <th className="py-3 px-4 text-left">Quality</th>
                                        <th className="py-3 px-4 text-left">Features</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-[#e7f0dc]">
                                        <td className="py-3 px-4 font-medium">Our Platform</td>
                                        <td className="py-3 px-4">Free/Premium</td>
                                        <td className="py-3 px-4">Extremely fast</td>
                                        <td className="py-3 px-4">Extremely high</td>
                                        <td className="py-3 px-4">Multiple style options, integrates GPT-4o technology</td>
                                    </tr>
                                    <tr className="border-b border-[#e7f0dc]">
                                        <td className="py-3 px-4 font-medium">GPT-4o</td>
                                        <td className="py-3 px-4">Paid membership</td>
                                        <td className="py-3 px-4">Extremely fast</td>
                                        <td className="py-3 px-4">Extremely high</td>
                                        <td className="py-3 px-4">Advanced AI, limited to paid users</td>
                                    </tr>
                                    <tr className="border-b border-[#e7f0dc]">
                                        <td className="py-3 px-4 font-medium">Grok Ghibli</td>
                                        <td className="py-3 px-4">Subscription</td>
                                        <td className="py-3 px-4">Fast</td>
                                        <td className="py-3 px-4">High</td>
                                        <td className="py-3 px-4">Limited style options</td>
                                    </tr>
                                    <tr className="border-b border-[#e7f0dc]">
                                        <td className="py-3 px-4 font-medium">OpenArt Studio Ghibli</td>
                                        <td className="py-3 px-4">Free</td>
                                        <td className="py-3 px-4">Medium</td>
                                        <td className="py-3 px-4">Medium-high</td>
                                        <td className="py-3 px-4">Multiple style options</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 px-4 font-medium">Other Generators</td>
                                        <td className="py-3 px-4">Varies</td>
                                        <td className="py-3 px-4">Slow-Medium</td>
                                        <td className="py-3 px-4">Medium</td>
                                        <td className="py-3 px-4">Basic functionality</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* 新闻与趋势 */}
                <section className="container mx-auto px-4 py-16">
                    <h2 className="text-3xl font-bold mb-8 text-center text-[#1c4c3b]">Latest in AI Art Transformation Trends</h2>
                    <p className="text-xl text-[#506a3a] mb-10 text-center max-w-3xl mx-auto">
                        The artistic style transfer phenomenon has taken the internet by storm
                    </p>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b] mb-10">
                        <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Social Media Sensation</h3>
                        <p className="text-[#506a3a] mb-4">
                            As of recent updates, GPT-4o has made significant breakthroughs in image stylization, with artistic transformations going viral on social media. Many users are particularly drawn to the Ghibli style option, among other available styles.
                        </p>
                        <p className="text-[#506a3a]">
                            Even tech industry leaders have joined the trend by sharing their stylized portraits, commenting on the unexpected popularity of these artistic features.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                            <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Comparing AI Ghibli Generators</h3>
                            <p className="text-[#506a3a] mb-4">
                                While tools like Grok Ghibli and OpenArt Studio Ghibli provide similar functionality, our platform integrates the latest GPT-4o technology for superior results.
                            </p>
                            <p className="text-[#506a3a]">
                                Independent comparisons show our style transformation tool outperforms many paid alternatives in quality and accuracy.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                            <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Creative Applications</h3>
                            <p className="text-[#506a3a] mb-4">
                                Professional designers are using our platform to create concept art, marketing materials, and unique digital assets with distinctive artistic styles.
                            </p>
                            <p className="text-[#506a3a]">
                                Many users report that stylized portraits generated through our system have become their most engaging social media profile pictures.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 统计区域 */}
                {/* <section className="container mx-auto px-4 py-16 text-center">
                    <h2 className="text-3xl font-bold mb-8 text-[#1c4c3b]">Trusted by Millions</h2>
                    <p className="text-xl text-[#506a3a] mb-16">
                        Join the world's largest ghibli style image generator community
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <p className="text-4xl font-bold text-[#1c4c3b] mb-2">3M+</p>
                            <p className="text-lg text-[#506a3a]">Monthly Active Users</p>
                        </div>

                        <div>
                            <p className="text-4xl font-bold text-[#1c4c3b] mb-2">1,530</p>
                            <p className="text-lg text-[#506a3a]">Images Generated Per Minute</p>
                        </div>

                        <div>
                            <p className="text-4xl font-bold text-[#1c4c3b] mb-2">4.9</p>
                            <p className="text-lg text-[#506a3a]">Average Image Quality Rating</p>
                        </div>
                    </div>
                </section> */}

                {/* 用户评价 */}
                {/* <section className="bg-[#e7f0dc] py-16">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold mb-8 text-center text-[#1c4c3b]">What Users Say About Our Studio Ghibli Style AI</h2>
                        <p className="text-xl text-[#506a3a] mb-16 text-center">
                            Hear from creators and professionals who use our AI image generator daily
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    name: 'Tony Miller',
                                    title: 'Digital Artist at ArtStation',
                                    comment: 'This ghibli style image generator is a game-changer. The model generates incredibly detailed images that I use for concept art. The quality is unbelievable!'
                                },
                                {
                                    name: 'Emma Chen',
                                    title: 'Photographer & Visual Designer',
                                    comment: 'I transformed my landscape photos into dreamlike Ghibli landscapes using this tool. The results showcase a perfect blend of reality and fantasy that my clients love.'
                                },
                                {
                                    name: 'Robert Wang',
                                    title: 'Independent Game Developer',
                                    comment: 'As an indie game developer, this advanced ghibli prompt tool has been invaluable. The speed and quality of asset generation is unmatched, saving me countless hours of work.'
                                },
                                {
                                    name: 'Christine Snow',
                                    title: 'YouTube Content Creator',
                                    comment: 'I use the ghibli photo generator daily for thumbnail creation. The text understanding is incredible - it accurately captures what I need, making my workflow so much smoother.'
                                },
                                {
                                    name: 'Michael Thompson',
                                    title: 'Educator & Illustrator',
                                    comment: 'I used this platform to create Ghibli-style illustrations for children\'s stories, inspiring my students\' creativity and imagination. The response has been amazing!'
                                },
                                {
                                    name: 'Sarah Lin',
                                    title: 'E-commerce Business Owner',
                                    comment: 'Running an online store requires constant image creation. This tool helps me create professional product visualizations with that magical Ghibli touch. My customers are enchanted!'
                                }
                            ].map((testimonial, index) => (
                                <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-[#d5e6c3] rounded-full mr-4"></div>
                                        <div>
                                            <h3 className="font-bold text-[#1c4c3b]">{testimonial.name}</h3>
                                            <p className="text-sm text-[#506a3a]">{testimonial.title}</p>
                                        </div>
                                    </div>
                                    <p className="text-[#506a3a]">{testimonial.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section> */}
            </main>
        </div>
    );
};

export default HomePage; 