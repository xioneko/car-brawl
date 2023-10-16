import fs from 'fs'
import path from 'path'
import axios from 'axios'
import parseHocon from 'hocon-parser'

const validatorConf = parseHocon(
    fs.readFileSync(path.join(process.cwd(), 'rnode.boot.conf')).toString(),
)
const readonlyConf = parseHocon(
    fs.readFileSync(path.join(process.cwd(), 'rnode.read.conf')).toString(),
)

const httpHost = validatorConf['protocol-server'].host
const httpPort = validatorConf['api-server']['port-http']
const httpAdminPort = validatorConf['api-server']['port-admin-http']
const httpReadonlyHost = readonlyConf['protocol-server'].host
const httpReadonlyPort = readonlyConf['api-server']['port-http']

export const http = axios.create({
    baseURL: `http://${httpHost}:${httpPort}`,
})
export const httpAdmin = axios.create({
    baseURL: `http://${httpHost}:${httpAdminPort}`,
})
export const httpReadonly = axios.create({
    baseURL: `http://${httpReadonlyHost}:${httpReadonlyPort}`,
})
