import ImageKit, { toFile } from "@imagekit/nodejs"
import config from "../config/config.js"

const client = new ImageKit({
    privateKey: config.IMAGEKIT_PRIVATE_KEY
})

/**
 * @description Uploads a file buffer to ImageKit CDN
 * @param {Object} params
 * @param {Buffer} params.buffer - The file buffer from multer.memoryStorage()
 * @param {string} params.fileName - The original file name
 */
export async function uploadFile({ buffer, fileName }) {
    const response = await client.files.upload({
        file: await toFile(buffer),
        fileName: fileName,
        folder: "snitch"
    })

    return response
}
