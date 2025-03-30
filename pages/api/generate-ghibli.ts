import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from "replicate";

const OPENROUTER_API_KEY = "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";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const image: string = req.body.image;

    if (!image) {
        return res.status(400).json({ error: 'Image is required' });
    }

    try {
        // 使用 Replicate 生成图像
        const replicate = new Replicate();
        const replicate_image = `data:application/octet-stream;base64,${image}`;
        const input = {
            image: replicate_image,
            prompt: "recreate this image in ghibli style",
            lora_scale: 1.1,
            output_format: "jpg",
            output_quality: 70,
            prompt_strength: 0.4,
            guidance_scale: 5
        };

        const output = await replicate.run("colinmcdonnell22/ghiblify-3:407b7fd425e00eedefe7db3041662a36a126f1e4988e6fbadfc49b157159f015", { input });

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

