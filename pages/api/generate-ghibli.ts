import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from "replicate";

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

    const { image, turnstileToken } = req.body;

    if (!turnstileToken) {
        console.error('Missing turnstileToken');
        return res.status(400).json({ error: 'Missing turnstileToken' });
    }

    if (!image) {
        console.error('Missing image');
        return res.status(400).json({ error: 'Missing image' });
    }

    // 验证 Turnstile token
    try {
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

        if (!turnstileData.success) {
            return res.status(400).json({ error: 'Invalid security token' });
        }

        // 使用 Replicate 生成图像
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

        if (Object.entries(output).length > 0) {
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

