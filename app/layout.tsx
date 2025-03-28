import React from 'react';
import '../styles/globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '吉卜力风格图像生成器 | Ghibli Style Image Generator',
    description: '使用AI创建惊人的吉卜力风格图像，几秒钟内生成。'
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh">
            <body>
                {children}
            </body>
        </html>
    );
} 