#!/usr/bin/env node
console.log('\033[2J')

const MIC_USERNAME = '',
      MIC_PASSWORD = '',
      MIC_TOPIC = 'thing-update/StartIoT/00000647'

/* Libs */
const ora = require('ora')
const logger = require('./lib/logger')
const MIC = require('./lib/MIC')
const MQTT = require('./lib/MQTTClient')
const IOHandler = require('./lib/IOHandler')

/* Init CLI */
const spinner = ora('Initializing MIC...')
spinner.color = 'green'
spinner.start()

/* Init MIC, fetch manifest */
MIC.init().then(() => {
  /* Login using defined parameters */
  return MIC.login(MIC_USERNAME, MIC_PASSWORD).then(() => {
    /* Init MQTT client with AWS config */
    spinner.text = 'Initializing MQTT client...'
    MQTT.init(MIC.AWS.config)
    setupEvents()
  })
})
.catch(error => {
  spinner.stop()
  logger.error('-- MIC: error,', error)
})

/* Setup event handlers */
const setupEvents = () => {
  MQTT.client.on('reconnect',  ()               => onReconnect())
  MQTT.client.on('connect',    ()               => onConnect())
  MQTT.client.on('message',    (topic, message) => onMessage(topic, message))
  MQTT.client.on('close',      ()               => logger.warn('-- MQTT: connection closed'))
  MQTT.client.on('error',      (e)              => logger.error('-- MQTT: error,', e))
  IOHandler.init(MIC)
}

/* On MQTT reconnect try to refresh AWS Cognito
 * credentials, update websocket credentials
 * and reconnect.
 */
const onReconnect = () => {
  logger.warn('-- MQTT: reconnect')

  MIC.refreshCredentials().then(() => {
    MQTT.client.end(true)
    MQTT.init(MIC.AWS.config)
    setupEvents()
  })
  .catch(err => logger.error('-- onReconnect: catch,', err))
}

/* On MQTT connection subscribe to configured topic.
 */
const onConnect = () => {
  spinner.stop()
  logger.info('-- MQTT: connected, subscribing to', MIC_TOPIC)

  MQTT.client.subscribe(MIC_TOPIC, {qos: 1}, (err, granted) => {
    if (err) logger.error('-- MQTT: error in message,', err)
  })

}

/* On MQTT message, parse the data & emit.
 */
const onMessage = (topic, message) => {
  const data = JSON.parse(message)

  try {
    topic = topic.split('/').pop()
    const { timestamp, payload, latlng, lsnr } = data.state.reported
    const rssi = data.state.reported.tcxn.cellular.rssi
    logger.info(`-- MQTT: got message, [${topic}]: ${payload}`)
    let packet = { timestamp, topic, payload, latlng, lsnr, rssi }
    IOHandler.onMessage(packet)
  } catch (e) {
    logger.warn('-- MQTT: failed to parse message', e)
  }
}
