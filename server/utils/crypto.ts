import crypto from 'node:crypto'

const Algorithm = 'aes-256-ctr'
const Key = process.env.ACCESS_TOKEN_KEY!

export function encrypt(text: string, iv: string) {
    const cipher = crypto.createCipheriv(Algorithm, Key, iv)
    const encrypted = cipher.update(text, 'utf-8', 'hex')
    return encrypted + cipher.final('hex')
}

export function decrypt(data: string, iv: string) {
    const decipher = crypto.createDecipheriv(Algorithm, Key, iv)
    const decrypted = decipher.update(data, 'hex', 'utf-8')
    return decrypted + decipher.final('utf-8')
}
