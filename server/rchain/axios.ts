import axios from 'axios'
import parseHocon from 'hocon-parser'
import { resolvePath } from '@nuxt/kit'

const bootConf = parseHocon(resolvePath('~/rnode.boot.conf'))
const readConf = parseHocon(resolvePath('~/rnode.read.conf'))

const host = process.env.RNODE_HOST
const port = {
    http: bootConf['api-server']['port-http'],
    admin: bootConf['api-server']['port-admin-http'],
    read: readConf['api-server']['port-http'],
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
