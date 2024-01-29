// import { env } from '@main/config/enviroment'
// import console from 'console'
// async function start (): Promise<void> {
// }
// start().catch(console.log)

import { receiveMessageFromQueue, sendMessageToQueue } from '@main/exemplo1'
// import * as console from 'console'

// sendMessageToQueue()
//   .then((res) => {
//   console.log(`Resposta(sendMessageToQueue): `, res)
// }).catch((error) => {
//   console.log(`Erro(sendMessageToQueue): `, error)
// })

receiveMessageFromQueue()
//   .then((res) => {
//   console.log(`Resposta(receiveMessageFromQueue): `, res)
// }).catch((error) => {
//   console.log(`Erro(receiveMessageFromQueue): `, error)
// })
