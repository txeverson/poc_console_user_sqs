import { SQS } from 'aws-sdk';

interface Message {
  id: string;
  data: string;
}

class SQSQueue {
  private sqs: SQS;
  private queueUrl: string;

  constructor(queueUrl: string) {
    this.sqs = new SQS();
    this.queueUrl = queueUrl;
  }

  public async addMessage(message: Message): Promise<void> {
    const params: SQS.SendMessageRequest = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(message),
    };

    await this.sqs.sendMessage(params).promise();
  }

  public async processMessages(callback: (message: Message) => Promise<void>): Promise<void> {
    while (true) {
      const messages = await this.receiveMessages();
      if (messages.length === 0) {
        // No messages, wait for a while before checking again
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        // Process messages
        for (const message of messages) {
          await callback(message);
          // await this.deleteMessage(message.ReceiptHandle!);
          await this.deleteMessage(message.id!);
        }
      }
    }
  }

  private async receiveMessages(): Promise<Message[]> {
    const params: SQS.ReceiveMessageRequest = {
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
      VisibilityTimeout: 30,
      WaitTimeSeconds: 20,
    };

    const result = await this.sqs.receiveMessage(params).promise();

    return (result.Messages || []).map(msg => JSON.parse(msg.Body!));
  }

  private async deleteMessage(receiptHandle: string): Promise<void> {
    const params: SQS.DeleteMessageRequest = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    };

    await this.sqs.deleteMessage(params).promise();
  }
}

// Exemplo de uso:

const queueUrl = 'sua-url-da-fila-sqs'; // Substitua pela URL correta
const sqsQueue = new SQSQueue(queueUrl);

// Adiciona uma mensagem à fila
sqsQueue.addMessage({ id: '1', data: 'Mensagem de teste' })
  .then(() => console.log('Mensagem adicionada com sucesso'))
  .catch(error => console.error('Erro ao adicionar mensagem:', error));

// Processa mensagens da fila
sqsQueue.processMessages(async (message: Message) => {
  console.log('Mensagem recebida:', message);
  // Faça o processamento desejado com a mensagem
});
