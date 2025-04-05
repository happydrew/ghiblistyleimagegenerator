import Replicate from "replicate";
import { supabaseAdmin } from '@/lib/supabase_service';
import { hasEnoughCredits, deductCredits } from '@lib/credits_service';
import { NextRequest, NextResponse } from 'next/server';

// 可选：设置为edge运行时
// export const runtime = "edge";

export async function POST(request: NextRequest) {
    try {
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

        // 使用 Replicate 生成图像
        const replicate_start = Date.now();
        const replicate = new Replicate();
        const replicate_image = `data:application/octet-stream;base64,${image}`;
        const input = accessToken ? {
            image: replicate_image,
            prompt: "GHBLI anime style photo",
            prompt_strength: 0.55,
            num_inference_steps: 38,
            guidance_scale: 10,
            lora_scale: 1.05,
            output_quality: 80,
            go_fast: true
        } : {
            image: replicate_image,
            prompt: "GHBLI anime style photo",
            prompt_strength: 0.55,
            num_inference_steps: 28,
            guidance_scale: 10,
            lora_scale: 1.05,
            output_quality: 70,
            go_fast: true
        };

        const output = await replicate.run("aaronaftab/mirage-ghibli:166efd159b4138da932522bc5af40d39194033f587d9bdbab1e594119eae3e7f", { input });

        console.log(`replicate time: ${Date.now() - replicate_start}ms`);

        if (Array.isArray(output) && output.length > 0) {
            // 生成成功，如果是登录用户，扣除1点积分
            if (userId) {
                const deducted = await deductCredits(userId, 1, 'Generated ghibli style image');
                if (!deducted) {
                    console.error(`Failed to deduct credit for user ${userId}`);
                    // 继续返回生成结果，但记录错误
                }
            }

            return NextResponse.json({
                success: true,
                ghibliImage: output[0].toString('base64')
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'Failed to generate image'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to generate image'
        }, { status: 500 });
    }
}

