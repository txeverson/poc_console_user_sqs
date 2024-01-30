import { SQSQueue, Message } from '@main/sqs/queue'
import express, { Express } from 'express'
import console from 'console'

const queueUrl = 'https://sqs.us-east-2.amazonaws.com/245857777462/poc-importing-users-queue'
const waitingForMessages = 5
const sqs = new SQSQueue(queueUrl)

const app = express()
app.use(express.json())

async function routes (): Promise<Express> {

  let count = 0

  app.get('/queue/send', (req, res) => {
    count++

    const data: Message = {
      Id: count,
      Data: `Esta é a mensagem de número: ${count}`
    }

    sqs.sendMessageToQueue(data)

    res.send({ response: 'Mensagem enviada com sucesso!' })
  })

  return app
}

async function main () {

  const route = await routes()

  route.listen(3000, () => {
    console.log(`For the UI, open http://localhost:3000/queue/send`)
  })

  await sqs.receiveMessageFromQueueLoop(waitingForMessages)

}

main()
