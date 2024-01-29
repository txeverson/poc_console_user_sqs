import { SQSQueue, Message } from '@main/sqs/queue'
import express from 'express'
import console from 'console'

const queueUrl = 'https://sqs.us-east-2.amazonaws.com/245857777462/poc-importing-users-queue'
const waitingForMessages = 5
const sqs = new SQSQueue(queueUrl)

sqs.receiveMessageFromQueueLoop(waitingForMessages)


// Express test
let count = 0
const app = express()

app.use(express.json())
app.get('/queue/send', (req, res) => {
  count++

  const data: Message = {
    Id: count,
    Data: `Esta é a mensagem de número: ${count}`
  }

  sqs.sendMessageToQueue(data)

  res.send({ response: 'Mensagem enviada com sucesso!' })
})

app.listen(3000, () => {
  console.log(`For the UI, open http://localhost:3000`)
})
