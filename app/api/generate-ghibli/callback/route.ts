import { NextRequest, NextResponse } from 'next/server';

// 处理来自Kie.ai的回调通知
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // 记录回调数据
        console.log('Received callback from Kie.ai:', data);

        // 这里可以实现额外的逻辑，例如：
        // 1. 将任务结果保存到数据库
        // 2. 向用户发送通知
        // 3. 更新任务状态记录

        // 返回成功响应
        return NextResponse.json({
            success: true,
            message: 'Callback received successfully'
        });

    } catch (error) {
        console.error('Error processing callback:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process callback'
        }, { status: 500 });
    }
} 