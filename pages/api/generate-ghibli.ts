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
            prompt: "GHBLI anime style photo",
            prompt_strength: 0.55,
            num_inference_steps:38,
            guidance_scale:10,
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

