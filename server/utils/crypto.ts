import crypto from 'node:crypto'

const Algorithm = 'aes-256-ctr'
const Key = process.env.ACCESS_TOKEN_KEY!
const IV = crypto.randomBytes(16)

export function encrypt(text: string) {
    const cipher = crypto.createCipheriv(Algorithm, Key, IV)
    const encrypted = cipher.update(text, 'utf-8', 'hex')
    return encrypted + cipher.final('hex')
}

export function decrypt(data: string) {
    const decipher = crypto.createDecipheriv(Algorithm, Key, IV)
    const decrypted = decipher.update(data, 'hex', 'utf-8')
    return decrypted + decipher.final('utf-8')
}
