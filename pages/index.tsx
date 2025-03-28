import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';

// 自定义组件
import { Tag } from '../components';

const HomePage = () => {
    const [showModal, setShowModal] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [selectedImage, setSelectedImage] = useState('');
    const [showImageViewer, setShowImageViewer] = useState(false);

    // 示例提示词
    const examplePrompts = [
        "A small countryside town in Ghibli style, sunset, with a winding path leading to a castle in the distance",
        "Transform a portrait into a Ghibli-style character, focusing on details and whimsy",
        "A magical forest with spirits and soft glowing lights in Miyazaki style",
        "An oceanic scene with flying machines and fluffy clouds in Ghibli aesthetic"
    ];

    const handleRandomPrompt = () => {
        const randomIndex = Math.floor(Math.random() * examplePrompts.length);
        setPrompt(examplePrompts[randomIndex]);
    };

    const handleGenerateClick = () => {
        setShowModal(true);
    };

    const handleImageClick = (imageSrc) => {
        setSelectedImage(imageSrc);
        setShowImageViewer(true);
    };

    return (
        <div className="min-h-screen bg-[#f5f9ee]">
            {/* 弹窗 */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-xl max-w-md border-2 border-[#89aa7b] shadow-xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 mb-4 rounded-full bg-[#e7f0dc] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#1c4c3b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-[#1c4c3b]">Almost Ready!</h3>
                            <p className="text-[#506a3a] mb-4">
                                Thank you for your interest! Our Ghibli-style image generator is just getting its final touches.
                                Please wait a moment while we prepare this magical feature for you.
                            </p>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-[#1c4c3b] text-white rounded-lg hover:bg-[#2a6854] transition"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 添加图片查看器模态框 */}
            {showImageViewer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80" onClick={() => setShowImageViewer(false)}>
                    <div className="relative max-w-4xl max-h-[90vh] p-2 bg-white/10 rounded-lg backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="absolute right-3 top-3 bg-white/30 rounded-full p-2 text-white hover:bg-white/50 transition z-10"
                            onClick={() => setShowImageViewer(false)}
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

            <Head>
                <title>Ghibli Style Image Generator | AI-Powered Studio Ghibli Image Generator</title>
                <meta name="description" content="Create stunning Ghibli-style AI-generated images in seconds with our free ghibli style image generator. Powered by ChatGPT-4o technology." />
                <link rel="icon" href="/favicon.ico" />
                {/* Additional SEO meta tags */}
                <meta name="keywords" content="ghibli style image generator, chatgpt ghibli prompt, studio ghibli style ai chatgpt, ghibli art chatgpt, chatgpt 4o ghibli" />
                <meta property="og:title" content="Ghibli Style Image Generator | AI-Powered Miyazaki-Style Generator" />
                <meta property="og:description" content="Transform your ideas into magical Ghibli-style illustrations with our AI image generator. Free, fast, and incredibly accurate." />
                <meta property="og:type" content="website" />
            </Head>

            {/* 导航栏 */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#e7f0dc]/90 backdrop-blur-sm border-b border-[#89aa7b]">
                <div className="container mx-auto px-4 py-1 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Image src="/favicon.ico" alt="Ghibli Style AI Generator Logo" width={40} height={40} className="rounded-lg" />
                        <h1 className="text-lg font-bold text-[#1c4c3b]">Generate Ghibli Style Image</h1>
                    </div>
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#about" className="text-[#506a3a] hover:text-[#1c4c3b] transition">About</a>
                        <a href="#features" className="text-[#506a3a] hover:text-[#1c4c3b] transition">Features</a>
                        <a href="#examples" className="text-[#506a3a] hover:text-[#1c4c3b] transition">Examples</a>
                        <a href="#faq" className="text-[#506a3a] hover:text-[#1c4c3b] transition">FAQ</a>
                    </nav>
                    <div className="flex items-center space-x-4">
                        <select className="bg-transparent border-none text-sm text-[#506a3a]" aria-label="Select Language">
                            <option value="en">English</option>
                            <option value="zh">中文</option>
                        </select>
                        <button className="bg-[#1c4c3b] text-white px-3 py-1 text-sm rounded-lg hover:bg-[#2a6854] transition">
                            Login
                        </button>
                    </div>
                </div>
            </header>

            <main className="pt-16">
                {/* 英雄区域 */}
                <section className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#1c4c3b]">Generate Ghibli Style Image</h1>
                    <p className="text-xl md:text-2xl text-[#506a3a] mb-6 max-w-3xl mx-auto">
                        Create stunning Miyazaki-style AI-generated images in seconds
                    </p>
                    <p className="text-md text-[#506a3a] mb-12 max-w-3xl mx-auto">
                        Powered by ChatGPT-4o technology | Free, fast, and incredibly accurate
                    </p>
                    <div className="bg-[#e7f0dc] p-6 rounded-xl max-w-4xl mx-auto shadow-lg border border-[#89aa7b]">
                        <h2 className="text-2xl font-bold mb-6 text-[#1c4c3b]">Studio Ghibli AI Image Generator</h2>

                        <div className="mb-6">
                            <textarea
                                className="w-full p-4 border border-[#89aa7b] rounded-lg focus:ring-2 focus:ring-[#1c4c3b] focus:border-transparent resize-none bg-white/90"
                                rows={3}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Enter your chatgpt ghibli prompt (e.g., A small countryside town in Ghibli style, sunset, with a winding path leading to a castle in the distance)"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="flex flex-col items-center">
                                <button className="w-full py-2 border border-[#89aa7b] rounded-lg hover:bg-[#d5e6c3] transition text-[#506a3a]">
                                    Square Ratio
                                </button>
                            </div>
                            <div className="flex flex-col items-center">
                                <button className="w-full py-2 border border-[#89aa7b] rounded-lg hover:bg-[#d5e6c3] transition text-[#506a3a]">
                                    Vibrant Colors
                                </button>
                            </div>
                            <div className="flex flex-col items-center">
                                <button className="w-full py-2 border border-[#89aa7b] rounded-lg hover:bg-[#d5e6c3] transition text-[#506a3a]">
                                    Soft Lighting
                                </button>
                            </div>
                            <div className="flex flex-col items-center">
                                <button className="w-full py-2 border border-[#89aa7b] rounded-lg hover:bg-[#d5e6c3] transition text-[#506a3a]">
                                    Dreamlike
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between mb-6">
                            <button className="px-4 py-2 border border-[#89aa7b] rounded-lg hover:bg-[#d5e6c3] transition text-[#506a3a]">
                                Advanced Settings
                            </button>
                            <div className="flex space-x-4">
                                <button className="px-4 py-2 border border-[#89aa7b] rounded-lg hover:bg-[#d5e6c3] transition text-[#506a3a]">
                                    Clear
                                </button>
                                <button
                                    className="px-4 py-2 border border-[#89aa7b] rounded-lg hover:bg-[#d5e6c3] transition text-[#506a3a]"
                                    onClick={handleRandomPrompt}
                                >
                                    Random
                                </button>
                                <button
                                    className="px-4 py-2 bg-[#1c4c3b] text-white rounded-lg hover:bg-[#2a6854] transition"
                                    onClick={handleGenerateClick}
                                >
                                    Generate
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-[#506a3a] mt-4">
                            Powered by <span className="font-semibold">ChatGPT-4o technology</span> | Create ghibli image chatgpt with stunning detail
                        </p>
                    </div>
                </section>

                {/* 添加关于Ghibli风格的介绍部分 */}
                <section id="about" className="container mx-auto px-4 py-16">
                    <h2 className="text-3xl font-bold mb-8 text-center text-[#1c4c3b]">Exploring the Artistic Magic of Dreamlike Worlds</h2>
                    <p className="text-lg text-[#506a3a] mb-10 text-center max-w-3xl mx-auto">
                        Studio Ghibli, founded in 1985 by Hayao Miyazaki, is known for meticulously hand-drawn animations and dreamlike aesthetics
                    </p>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-bold mb-4 text-[#1c4c3b]">What is Ghibli Style Art?</h3>
                            <p className="text-[#506a3a] mb-4">
                                Ghibli-style images are characterized by soft and warm color palettes, delicate line designs, dreamlike natural settings, and a blend of realism and fantasy.
                            </p>
                            <p className="text-[#506a3a] mb-4">
                                With the latest advancements in ChatGPT-4o technology, generating Ghibli-style images has become a sensation on the internet, with millions of users creating these enchanting visuals.
                            </p>
                            <p className="text-[#506a3a]">
                                Even OpenAI's CEO Sam Altman joined the trend by changing his profile picture to a Ghibli-style self-portrait, highlighting the massive popularity of this artistic style.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                            <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Ghibli Style Characteristics:</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <span className="w-5 h-5 bg-[#e7f0dc] rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="w-2 h-2 bg-[#1c4c3b] rounded-full"></span>
                                    </span>
                                    <span className="text-[#506a3a]">Soft and warm color palettes that evoke nostalgia</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-5 h-5 bg-[#e7f0dc] rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="w-2 h-2 bg-[#1c4c3b] rounded-full"></span>
                                    </span>
                                    <span className="text-[#506a3a]">Delicate and intricate line designs with careful attention to detail</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-5 h-5 bg-[#e7f0dc] rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="w-2 h-2 bg-[#1c4c3b] rounded-full"></span>
                                    </span>
                                    <span className="text-[#506a3a]">Dreamlike natural settings and ethereal lighting effects</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-5 h-5 bg-[#e7f0dc] rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="w-2 h-2 bg-[#1c4c3b] rounded-full"></span>
                                    </span>
                                    <span className="text-[#506a3a]">Unique character designs with expressive features</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="w-5 h-5 bg-[#e7f0dc] rounded-full flex items-center justify-center mr-3 mt-1">
                                        <span className="w-2 h-2 bg-[#1c4c3b] rounded-full"></span>
                                    </span>
                                    <span className="text-[#506a3a]">Perfect blend of realism and fantasy in a cohesive style</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 改进灵感区域，包含更多prompt指南 */}
                <section id="examples" className="container mx-auto px-4 py-16">
                    <h2 className="text-3xl font-bold mb-8 text-center text-[#1c4c3b]">Get Inspired by Ghibli Art ChatGPT</h2>
                    <p className="text-xl text-[#506a3a] mb-10 text-center">
                        See what others have created with our ghibli style image generator free
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
                        <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Best ChatGPT Ghibli Prompts</h3>
                        <p className="text-[#506a3a] mb-4">
                            Based on recent user experiences and media reports, here are some effective prompts that deliver amazing results:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-[#f8fbf3] p-3 rounded-lg border border-[#d5e6c3]">
                                <p className="text-[#506a3a] italic">"Convert the photo into a Ghibli-style character, focusing on details and whimsy."</p>
                            </div>
                            <div className="bg-[#f8fbf3] p-3 rounded-lg border border-[#d5e6c3]">
                                <p className="text-[#506a3a] italic">"Transform this photo into a hand-drawn animation illustration with watercolor techniques and soft organic lines."</p>
                            </div>
                            <div className="bg-[#f8fbf3] p-3 rounded-lg border border-[#d5e6c3]">
                                <p className="text-[#506a3a] italic">"Create a dreamlike landscape in Miyazaki style with magical elements and warm color palette."</p>
                            </div>
                            <div className="bg-[#f8fbf3] p-3 rounded-lg border border-[#d5e6c3]">
                                <p className="text-[#506a3a] italic">"Ghibli-fy this photo while maintaining the original composition and adding magical, dreamy aesthetics."</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <h3 className="text-2xl font-bold mb-4 text-[#1c4c3b]">How to Create Ghibli Image with ChatGPT?</h3>
                        <p className="text-lg text-[#506a3a] mb-6 max-w-3xl mx-auto">
                            Our platform makes it simple to convert image to ghibli style with just a few clicks
                        </p>

                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="bg-white p-5 rounded-xl shadow-md border border-[#89aa7b]">
                                <div className="w-12 h-12 bg-[#e7f0dc] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-xl font-bold text-[#1c4c3b]">1</span>
                                </div>
                                <h4 className="font-bold text-[#1c4c3b] mb-2">Enter Your Prompt</h4>
                                <p className="text-[#506a3a] text-sm">
                                    Describe what you want or use our chatgpt studio ghibli prompt examples
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
                                    Get your studio ghibli style ai chatgpt masterpiece instantly
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 补充功能区域 */}
                <section id="features" className="bg-[#e7f0dc] py-16">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold mb-8 text-center text-[#1c4c3b]">Key Features of Our Ghibli Style Image Generator</h2>
                        <p className="text-xl text-[#506a3a] mb-16 text-center max-w-3xl mx-auto">
                            Experience next-generation chatgpt image generator technology - powerful, free, and privacy-focused
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                                <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Advanced AI Technology</h3>
                                <p className="text-[#506a3a]">
                                    Powered by ChatGPT-4o's cutting-edge algorithms that perfectly capture Ghibli's unique artistic style, color palettes, and dreamlike aesthetics.
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
                                    Our chatgpt ghibli prompt system accurately interprets complex text descriptions and provides impressive results every time.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                                <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Lightning-Fast Generation</h3>
                                <p className="text-[#506a3a]">
                                    Optimized inference pipeline ensures you can create ghibli image chatgpt masterpieces in seconds without compromising on quality.
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
                                    Create a variety of ghibli portraits and landscapes - from realistic to fantastical, from everyday scenes to magical worlds.
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
                        Have other questions? Contact us at support@ghiblistyle.ai
                    </p>

                    <div className="max-w-3xl mx-auto space-y-6">
                        {[
                            {
                                question: 'What is a Ghibli style image generator and how does it work?',
                                answer: 'Our ghibli style image generator is an AI-powered tool that creates images in the distinctive style of Studio Ghibli animations. Powered by ChatGPT-4o technology, it allows you to create high-quality Miyazaki-style images from text descriptions, with no registration or usage limits.'
                            },
                            {
                                question: 'How do I create the best ghibli image with ChatGPT?',
                                answer: 'To achieve the best results, use detailed prompts that describe the scene, lighting, and mood you want. Try phrases like "Transform this into a Ghibli-style scene with soft watercolor techniques" or "Create a dreamy landscape in Miyazaki style with magical elements." Our system will interpret your chatgpt ghibli prompt and generate stunning images.'
                            },
                            {
                                question: 'Is your ghibli style image generator free to use?',
                                answer: 'Yes, our basic ghibli style image generator free version is completely free to use! We also offer premium options with higher resolution outputs, batch processing, and additional customization features for professional users.'
                            },
                            {
                                question: 'How is ChatGPT 4o Ghibli style different from other AI tools?',
                                answer: 'ChatGPT-4o\'s Ghibli-style generation is based on more advanced understanding capabilities, allowing it to better grasp the essence of Ghibli art rather than just applying surface filters. This results in generated images with higher artistic quality and consistency compared to other available tools.'
                            },
                            {
                                question: 'Can I use OpenAI Studio Ghibli functionality for photos with multiple people?',
                                answer: 'Yes, our system supports processing photos with multiple people, preserving each person\'s unique features while infusing them with Ghibli\'s artistic style. This makes it perfect for family photos or group pictures.'
                            },
                            {
                                question: 'How do you address copyright concerns with ghibli art chatgpt?',
                                answer: 'We\'ve developed our system to be inspired by the general aesthetic of Ghibli animation without directly copying specific characters or scenes. Our tool creates original artwork that captures the feel of Ghibli\'s style while respecting intellectual property rights. We encourage users to use generated images responsibly.'
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
                            See how our ghibli style image generator compares to other tools in the market
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
                                        <td className="py-3 px-4">Integrates ChatGPT-4o technology, best user experience</td>
                                    </tr>
                                    <tr className="border-b border-[#e7f0dc]">
                                        <td className="py-3 px-4 font-medium">ChatGPT-4o</td>
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
                    <h2 className="text-3xl font-bold mb-8 text-center text-[#1c4c3b]">Latest in Ghibli AI Art Trends</h2>
                    <p className="text-xl text-[#506a3a] mb-10 text-center max-w-3xl mx-auto">
                        The ChatGPT 4o Ghibli Style phenomenon has taken the internet by storm
                    </p>

                    <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b] mb-10">
                        <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">OpenAI's Social Media Sensation</h3>
                        <p className="text-[#506a3a] mb-4">
                            As of March 2025, OpenAI's GPT-4o has made significant breakthroughs in image generation, with Ghibli-style images going viral on social media. Recent reports indicate that millions of users have created Ghibli-style images, causing OpenAI's GPUs to be almost "overheated."
                        </p>
                        <p className="text-[#506a3a]">
                            Even OpenAI's CEO Sam Altman joined the trend by changing his social media profile picture to a Ghibli-style self-portrait, commenting on the unexpected popularity of this artistic feature.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                            <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Comparing AI Ghibli Generators</h3>
                            <p className="text-[#506a3a] mb-4">
                                While tools like Grok Ghibli and OpenArt Studio Ghibli provide similar functionality, our platform integrates the latest ChatGPT-4o technology for superior results.
                            </p>
                            <p className="text-[#506a3a]">
                                Independent comparisons show our ghibli style image generator free version outperforms many paid alternatives in quality and accuracy.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md border border-[#89aa7b]">
                            <h3 className="text-xl font-bold mb-4 text-[#1c4c3b]">Creative Applications</h3>
                            <p className="text-[#506a3a] mb-4">
                                Professional designers are using our platform to create concept art, marketing materials, and unique digital assets with the distinctive Ghibli aesthetic.
                            </p>
                            <p className="text-[#506a3a]">
                                Many users report that ghibli portraits generated through our system have become their most engaging social media profile pictures.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 统计区域 */}
                <section className="container mx-auto px-4 py-16 text-center">
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
                </section>

                {/* 用户评价 */}
                <section className="bg-[#e7f0dc] py-16">
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
                                    comment: 'As an indie game developer, this chatgpt ghibli prompt tool has been invaluable. The speed and quality of asset generation is unmatched, saving me countless hours of work.'
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
                </section>
            </main>

            {/* 页脚 */}
            <footer className="bg-[#1c4c3b] text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-6">
                                <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-lg" />
                                <h2 className="text-xl font-bold">Studio Ghibli AI</h2>
                            </div>
                            <p className="text-gray-300">
                                Studio Ghibli AI: Free, unlimited Miyazaki-style AI image generator. No registration, no limits.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-4">About Us</h3>
                            <ul className="space-y-2">
                                <li><a href="#features" className="text-gray-300 hover:text-white transition">Features</a></li>
                                <li><a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a></li>
                                <li><a href="#" className="text-gray-300 hover:text-white transition">Partners</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-4">Tools</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-300 hover:text-white transition">Upscale Image</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-[#2a6854] pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-300 mb-4 md:mb-0">© 2025 • Studio Ghibli AI. All rights reserved.</p>
                        <div className="flex space-x-6">
                            <a href="#" className="text-gray-300 hover:text-white transition">Privacy Policy</a>
                            <a href="#" className="text-gray-300 hover:text-white transition">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage; 