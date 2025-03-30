import sharp from 'sharp';

export { convertPngToWebp };

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