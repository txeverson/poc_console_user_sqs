import dotenv from 'dotenv'
import parseArgs from 'minimist'
import path from 'path'

const { argv } = process
const res = parseArgs(argv.slice(2))

dotenv.config({
  path: path.resolve(
    process.cwd(), `${res.env || ''}.env`
  )
})

export const env = {
  redisHost: process.env.REDIS_HOST,
  redisPort: +process.env.REDIS_PORT,
  bullPrefix: process.env.BULL_PREFIX,
  bullQueue: process.env.BULL_QUEUE,
  bullQueueJobFile: process.env.BULL_QUEUE_JOB_FILE,
}
