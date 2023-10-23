import { useLogger } from '@nuxt/kit'
import { Low } from 'lowdb/lib'
import { JSONFile } from 'lowdb/node'
import { format as prettyFormat } from 'pretty-format'
import _ from 'lodash'
import { UserConfig } from '~/models/config'

type ConfigJson = { [id: string]: UserConfig | undefined }

const logger = useLogger('Database')
if (process.dev) {
    logger.level = 4
}

const DB_FILE = 'user_config.json'

const db = new Low(new JSONFile<ConfigJson>(DB_FILE), {})

export async function getAllConfigs() {
    await db.read()
    return _.entries(db.data)
}

export async function getConfigById(id: string) {
    await db.read()
    logger.debug(`Get config of ${id}:\n`, prettyFormat(db.data))
    return db.data[id]
}

export async function upsertConfig(id: string, newConfig: UserConfig) {
    logger.debug(`Upsert config of ${id}:\n`, prettyFormat(newConfig))
    db.data[id] = newConfig
    await db.write()
}
