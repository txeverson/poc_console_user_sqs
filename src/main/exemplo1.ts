import { SQS } from 'aws-sdk'

// Configuração do AWS SDK
const sqs = new SQS({
  region: 'us-east-2', // Substitua pela região correta
  // accessKeyId: '...',
  // secretAccessKey: '...',
  // sessionToken: '...'
})

// URL da fila SQS
// const queueUrl = 'https://sqs.us-east-2.amazonaws.com/245857777462/poc-importing-users-queue.fifo' // Substitua pela URL correta
const queueUrl = 'https://sqs.us-east-2.amazonaws.com/245857777462/poc-importing-users-queue' // Substitua pela URL correta

// Enviar mensagem para a fila SQS
export const sendMessageToQueue = async () => {
  for (let count = 0; count <= 5; count++) {
    const params: SQS.SendMessageRequest = {
      // MessageGroupId: '43fcce4b-6bd1-4dfb-8cab-8ac0e1c8590c',
      MessageBody: `Esta é uma mensagem de exemplo 2-${count}`,
      QueueUrl: queueUrl,
    }

    try {
      const result = await sqs.sendMessage(params).promise()
      console.log('Mensagem enviada com sucesso:', result.MessageId)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }
}

// Receber mensagem da fila SQS
export const receiveMessageFromQueue = async () => {
  const params: SQS.ReceiveMessageRequest = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 1, // Número máximo de mensagens a serem recebidas
    VisibilityTimeout: 30, // Tempo em segundos que a mensagem não estará visível para outros consumidores
    WaitTimeSeconds: 20, // Tempo de espera para receber mensagens (long polling)
  }

  try {
    const result = await sqs.receiveMessage(params).promise()

    if (result.Messages && result.Messages.length > 0) {
      const message = result.Messages[0]
      console.log('Mensagem recebida:', message.Body)

      // Deletar a mensagem da fila após processamento
      await sqs
        .deleteMessage({
          QueueUrl: queueUrl,
          ReceiptHandle: message.ReceiptHandle!,
        })
        .promise()
      console.log('Mensagem deletada com sucesso.')
    } else {
      console.log('Nenhuma mensagem disponível.')
    }
  } catch (error) {
    console.error('Erro ao receber mensagem:', error)
  }
}

// Chamar as funções
// sendMessageToQueue();
// receiveMessageFromQueue();
