import {
  SNSClient,
  PublishCommand,
  SubscribeCommand,
  CreateTopicCommand,
} from '@aws-sdk/client-sns'
import {
  SQSClient,
  CreateQueueCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs'

export interface Message {
  Id: number
  Data: string
}

export class SnsQueue {
  private snsClient: SNSClient
  private sqsClient: SQSClient
  private readonly topicArn: string
  private readonly queueUrl: string

  constructor (topicArn: string, queueUrl: string) {
    this.snsClient = new SNSClient({})
    this.sqsClient = new SQSClient({})
    this.queueUrl = queueUrl
    this.topicArn = topicArn
  }

  async createSnsTopic (topicName: string): Promise<string> {
    const createTopicCommand = new CreateTopicCommand({ Name: topicName })
    const result = await this.snsClient.send(createTopicCommand)
    return result.TopicArn || ''
  }

  async createSqsQueue (queueName: string): Promise<string> {
    const createQueueCommand = new CreateQueueCommand({ QueueName: queueName })
    const result = await this.sqsClient.send(createQueueCommand)
    return result.QueueUrl || ''
  }

  async subscribeSqsToSnsTopic (queueUrl: string, topicArn: string): Promise<void> {
    const subscribeCommand = new SubscribeCommand({
      Protocol: 'sqs',
      TopicArn: topicArn,
      Endpoint: queueUrl,
    })

    await this.snsClient.send(subscribeCommand)
  }

  async publishMessageToSnsTopic (message: Message, topicArn?: string): Promise<void> {
    let arn = this.topicArn
    if (topicArn) {
      arn = topicArn
    }
    const publishCommand = new PublishCommand({
      TopicArn: arn,
      Message: JSON.stringify(message)
    })
    await this.snsClient.send(publishCommand)
  }

  async receiveMessageFromSqsQueue (queueUrl?: string): Promise<string | undefined> {
    let url = this.queueUrl
    if (queueUrl) {
      url = queueUrl
    }
    const receiveMessageCommand = new ReceiveMessageCommand({
      QueueUrl: url,
      MaxNumberOfMessages: 1,
      VisibilityTimeout: 10,
    })

    const result = await this.sqsClient.send(receiveMessageCommand)
    const message = result.Messages?.[0]

    if (message) {
      // Deleta a mensagem após recebê-la para evitar que seja processada novamente
      await this.deleteMessageFromSqsQueue(url, message.ReceiptHandle || '')
      return message.Body || undefined
    }

    return undefined
  }

  private async deleteMessageFromSqsQueue (queueUrl: string, receiptHandle: string): Promise<void> {
    const deleteMessageCommand = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    })

    await this.sqsClient.send(deleteMessageCommand)
  }

}

async function main () {
  try {

    const snsTopicArn = 'arn:aws:sns:us-east-2:245857777462:MySNSTopic'
    const sqsQueueUrl = 'https://sqs.us-east-2.amazonaws.com/245857777462/MySQSQueue'

    const snsQueue = new SnsQueue(snsTopicArn, sqsQueueUrl)

    // Publica uma mensagem no tópico SNS
    const msg: Message = {
      Id: 1,
      Data: 'Hello, SNS!'
    }
    await snsQueue.publishMessageToSnsTopic(msg)

    // Aguarda um pouco para a mensagem ser entregue à fila SQS
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Recebe e imprime a mensagem da fila SQS
    const receivedMessage = await snsQueue.receiveMessageFromSqsQueue()
    console.log(`Received message from SQS: ${receivedMessage}`)
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
