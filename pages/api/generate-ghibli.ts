import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from "replicate";
import { supabaseAdmin } from '@/lib/supabase_service';
import { hasEnoughCredits, deductCredits } from '@lib/credits_service';

// export const runtime = "edge";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "2mb", // 允许最大 10MB
        },
    },
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const clientIp = req.headers["x-forwarded-for"] ?
        (req.headers["x-forwarded-for"] as string).split(",")[0] : req.socket.remoteAddress;

    console.log(`request ip: ${clientIp}`);

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { image, turnstileToken, accessToken } = req.body;

    if (!turnstileToken || turnstileToken.length < 10) {
        console.error('Missing turnstileToken, or invalid length');
        return res.status(400).json({ error: 'Missing turnstileToken or invalid length' });
    }

    if (!image) {
        console.error('Missing image');
        return res.status(400).json({ error: 'Missing image' });
    }

    // 验证 Turnstile token
    try {
        // 验证 Access token 并检查用户点数
        let userId = null;

        if (accessToken) {
            // 验证 token 并获取用户ID
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

            if (error || !user) {
                return res.status(401).json({ error: 'Invalid access token' });
            }

            userId = user.id;
            console.log(`User ${userId} logged in`);

            // 检查用户点数是否大于0
            const hasCredits = await hasEnoughCredits(userId, 1);
            if (!hasCredits) {
                return res.status(402).json({ error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS' });
            }
        } else {
            // 允许未登录用户使用（可能有其他逻辑）
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
                return res.status(400).json({ error: 'Invalid security token' });
            }
            console.log('User not logged in, proceeding with free generation');
        }

        // 使用 Replicate 生成图像
        const replicate_start = Date.now();
        const replicate = new Replicate();
        const replicate_image = `data:application/octet-stream;base64,${image}`;
        const input = {
            image: replicate_image,
            prompt: "GHBLI anime style photo",
            prompt_strength: 0.55,
            num_inference_steps: 38,
            guidance_scale: 10,
            lora_scale: 1.05,
            output_quality: 80,
            go_fast: true
        };

        const output = await replicate.run("aaronaftab/mirage-ghibli:166efd159b4138da932522bc5af40d39194033f587d9bdbab1e594119eae3e7f", { input });

        console.log(`replicate time: ${Date.now() - replicate_start}ms`);

        if (Object.entries(output).length > 0) {
            // 生成成功，如果是登录用户，扣除1点积分
            if (userId) {
                const deducted = await deductCredits(userId, 1, 'Generated ghibli style image');
                if (!deducted) {
                    console.error(`Failed to deduct credit for user ${userId}`);
                    // 继续返回生成结果，但记录错误
                }
            }

            return res.status(200).json({
                success: true,
                ghibliImage: output[0].toString('base64')
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Failed to generate image'
            });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate image'
        });
    }
}

