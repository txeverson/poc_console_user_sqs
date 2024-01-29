import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs'
import console from 'console'

export interface Message {
  Id: number
  Data: string
}

export class SQSQueue {
  private sqsClient: SQSClient
  private readonly queueUrl: string

  constructor (queueUrl: string) {
    this.sqsClient = new SQSClient({})
    this.queueUrl = queueUrl
  }

  /**
   * Envia mensagens para o SQS
   */
  public async sendMessageToQueue (message: Message): Promise<void> {
    try {
      const sendMessageCommand = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
      })
      // Enviar a mensagem
      const response = await this.sqsClient.send(sendMessageCommand)
      // console.log('Mensagem enviada com sucesso:', response.MessageId)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  /**
   * Ler as mensagens do SQS
   */
  public async receiveMessageFromQueue (): Promise<void> {

    const receiveMessageCommand = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 1, // Número máximo de mensagens para receber
      VisibilityTimeout: 10, // Tempo durante o qual a mensagem não estará disponível para outros consumidores
      WaitTimeSeconds: 3, // Tempo máximo que o cliente espera por mensagens
    })

    try {
      // Receber mensagens
      const response = await this.sqsClient.send(receiveMessageCommand)

      // Processar as mensagens recebidas
      if (response.Messages && response.Messages.length > 0) {
        for (const message of response.Messages) {
          console.log('Mensagem Recebida:', message.Body)

          // Excluir a mensagem após processamento
          await this.deleteMessage(message.ReceiptHandle)
        }
      }
    } catch (error) {
      console.error('Erro ao receber mensagens:', error)
    }
  }

  private async deleteMessage (receiptHandle: string): Promise<void> {
    const deleteMessageCommand = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    })

    try {
      await this.sqsClient.send(deleteMessageCommand)
      // console.log('Mensagem excluída com sucesso')
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error)
    }
  }

  private async wait (seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000))
  }

  /**
   * Fica lendo as mensagens do SQS em um loop infinito.
   */
  public async receiveMessageFromQueueLoop (seconds: number) {
    while (true) {

      await this.receiveMessageFromQueue()

      // espera por 2 segundos
      await this.wait(seconds)
    }
  }

}
