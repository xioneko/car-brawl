import axios from 'axios'

const host = process.dev ? 'localhost' : process.env.RNODE_IP
const port = {
    http: process.env.RNODE_HTTP_PORT!,
    admin: process.env.RNODE_HTTP_ADMIN_PORT!,
    read: process.env.RNODE_HTTP_READ_PORT!,
}

export const rnodeHttp = axios.create({
    baseURL: `http://${host}:${port.http}`,
})
export const rnodeAdmin = axios.create({
    baseURL: `http://${host}:${port.admin}`,
})
export const rnodeRead = axios.create({
    baseURL: `http://${host}:${port.read}`,
})
