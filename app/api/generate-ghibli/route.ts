import { supabaseAdmin } from '@/lib/supabase_service';
import { hasEnoughCredits, deductCredits } from '@lib/credits_service';
import { NextRequest, NextResponse } from 'next/server';

// 可选：设置为edge运行时
// export const runtime = "edge";

export async function POST(request: NextRequest) {
    try {

        // return NextResponse.json({
        //     success: true,
        //     taskId: 'bf09df73fdcd5af0803a191713b4ccf7',
        //     status: 'GENERATING',
        //     message: 'Generation task created successfully'
        // }, { status: 200 });

        // 获取客户端IP
        const forwardedFor = request.headers.get("x-forwarded-for");
        const clientIp = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
        console.log(`request ip: ${clientIp}`);

        // 解析请求体
        const requestData = await request.json();
        const { image, turnstileToken, accessToken } = requestData;

        if (!turnstileToken || turnstileToken.length < 10) {
            console.error('Missing turnstileToken, or invalid length');
            return NextResponse.json(
                { error: 'Missing turnstileToken or invalid length' },
                { status: 400 }
            );
        }

        if (!image) {
            console.error('Missing image');
            return NextResponse.json(
                { error: 'Missing image' },
                { status: 400 }
            );
        }

        // 验证 Turnstile token 并检查用户点数
        let userId = null;

        if (accessToken) {
            // 验证 token 并获取用户ID
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

            if (error || !user) {
                return NextResponse.json(
                    { error: 'Invalid access token' },
                    { status: 401 }
                );
            }

            userId = user.id;
            console.log(`User ${userId} logged in`);

            // 检查用户点数是否大于0
            const hasCredits = await hasEnoughCredits(userId, 1);
            if (!hasCredits) {
                return NextResponse.json(
                    { error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS' },
                    { status: 402 }
                );
            }
        } else {
            // 允许未登录用户使用（需要验证turnstile）
            const start = Date.now();
            const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    secret: process.env.TURNSTILE_SECRET_KEY,  // 在环境变量中设置
                    response: turnstileToken,
                }),
            });

            const turnstileData = await turnstileRes.json();
            console.log(`turnstile verify time: ${Date.now() - start}ms`);

            if (!turnstileData.success) {
                return NextResponse.json(
                    { error: 'Invalid security token' },
                    { status: 400 }
                );
            }
            console.log('User not logged in, proceeding with free generation');
        }

        // 使用 Kie.ai 的 4o Image API 创建生成任务
        const apiKey = process.env.KIE_API_KEY;
        if (!apiKey) {
            console.error('Missing KIE_API_KEY in environment variables');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // 上传图片到ImgBB并获取URL
        const imageUrl = await uploadToImgBB(image);
        console.log(`Image uploaded to ImgBB: ${imageUrl}`);

        // 构建请求体，使用ImgBB返回的URL
        const apiRequestBody: any = {
            fileUrl: imageUrl, // 使用ImgBB返回的URL代替原始base64
            prompt: "do a ghibli style of the image",
            size: '1:1'
        };

        // 发送请求到 Kie.ai API
        const apiResponse = await fetch('https://kieai.erweima.ai/api/v1/gpt4o-image/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(apiRequestBody)
        });

        console.log(`Kie.ai API response : ${JSON.stringify(apiResponse)}`);

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            console.error('Kie.ai API error :', JSON.stringify(errorData));
            return NextResponse.json(
                { error: 'Failed to create generation task', details: errorData },
                { status: apiResponse.status }
            );
        }

        // 获取任务ID和其他响应信息
        const taskResp = await apiResponse.json();
        if (!taskResp.data?.taskId) {
            console.error('Kie.ai API response missing taskId:', JSON.stringify(taskResp));
            return NextResponse.json(
                { error: 'Failed to create generation task', details: taskResp },
                { status: 500 }
            );
        }
        const taskId = taskResp.data.taskId;
        console.log(`Generation task created with ID: ${taskId}`);

        // 如果是登录用户，此时先扣除积分
        // 注意：实际应用中可能需要在任务成功后才扣除积分
        if (userId) {
            const deducted = await deductCredits(userId, 1, 'Generated ghibli style image');
            if (!deducted) {
                console.error(`Failed to deduct credit for user ${userId}`);
                // 继续返回任务信息，但记录错误
            }
        }

        return NextResponse.json({
            success: true,
            taskId: taskId,
            status: 'GENERATING',
            message: 'Generation task created successfully'
        }, { status: 200 });

    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to create generation task'
        }, { status: 500 });
    }
}

// 上传图片到ImgBB并返回URL
async function uploadToImgBB(image: string): Promise<string> {
    const imgbbApiKey = process.env.IMGBB_API_KEY;
    if (!imgbbApiKey) {
        throw new Error('Missing IMGBB_API_KEY in environment variables');
    }

    // 如果图片是base64字符串，确保正确格式化
    let imageBase64 = image;
    if (image.includes(',')) {
        // 如果base64包含data URL前缀，则提取纯base64部分
        imageBase64 = image.split(',')[1];
    }

    try {
        // 方法1: 使用FormData (现代浏览器和Node.js环境)
        const formData = new FormData();
        formData.append('image', imageBase64);

        const response = await fetch(`https://api.imgbb.com/1/upload?expiration=300&key=${imgbbApiKey}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success || !data.data?.url) {
            console.error('ImgBB API response invalid:', JSON.stringify(data));
            throw new Error('Invalid response from ImgBB');
        }

        console.log('Image uploaded to ImgBB successfully');
        return data.data.url;
    } catch (error) {
        console.error('Error using FormData method:', error);

        // 方法2: 如果FormData方法失败，尝试使用URL编码方式
        console.log('Trying alternative method for ImgBB upload...');

        const params = new URLSearchParams();
        params.append('key', imgbbApiKey);
        params.append('image', imageBase64);
        params.append('expiration', '300');

        const altResponse = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });

        if (!altResponse.ok) {
            const errorData = await altResponse.json();
            console.error('ImgBB API error (alt method):', JSON.stringify(errorData));
            throw new Error('Failed to upload image to ImgBB');
        }

        const altData = await altResponse.json();
        if (!altData.success || !altData.data?.url) {
            console.error('ImgBB API response invalid (alt method):', JSON.stringify(altData));
            throw new Error('Invalid response from ImgBB');
        }

        console.log('Image uploaded to ImgBB successfully (alt method)');
        return altData.data.url;
    }
}

