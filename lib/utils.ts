export { convertPngToWebp, formatDate, generateVerificationCode };
import sharp from 'sharp';

async function convertPngToWebp(inputImg:
    | Buffer
    | ArrayBuffer
    | Uint8Array
    | Uint8ClampedArray
    | Int8Array
    | Uint16Array
    | Int16Array
    | Uint32Array
    | Int32Array
    | Float32Array
    | Float64Array
    | string, outputPath: string): Promise<Buffer> {
    try {
        const compressedImg = await sharp(inputImg)
            .webp({ quality: 80 })
            .toBuffer();
        return compressedImg;
    } catch (error) {
        console.error(`Error converting ${inputImg}:`, error);
    }
}

function formatDate(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ')
}

function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}