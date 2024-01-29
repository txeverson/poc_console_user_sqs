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

export const env =  {
  sqlUrl: process.env.SQS_URL,
}
