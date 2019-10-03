/* MQTT client class based on Pontus Aurdal's client.js file */

class MQTTClient {
  constructor( { username, password, topic, onMessage, socket } ){
    this.ora = require('ora')
    this.logger = require('./lib/logger')
    this.MIC = require('./lib/MIC')
    this.MQTT = require('./lib/MQTTClient')

    this.spinner = this.ora('Initializing Cloud Connect...')
    this.spinner.color = 'green'
    this.spinner.start()

    this.socket = socket

    this.username = username
    this.password = password
    this.topic = topic
    this.user_defined_message = onMessage

    /* Init MIC, fetch manifest */
    return this.MIC.init().then(() => {
      this.MIC.login(this.username, this.password).then(() => {

          this.spinner.text = 'Initializing MQTT client...'
          this.MQTT.init(this.MIC.AWS.config)
          this.setupEvents()

          return Promise.resolve()
      })
      .catch(error => {
        this.spinner.stop()
        this.logger.error('-- MIC: error,', error)

        return Promise.reject(error)
      })
    })
    .catch(() => this.spinner.stop())
  }

  setupEvents(){
    this.MQTT.client.on('reconnect',  ()               => this.onReconnect())
    this.MQTT.client.on('connect',    ()               => this.onConnect())
    this.MQTT.client.on('message',    (topic, message) => (this.user_defined_message) ? this.user_defined_message(topic, message) : this.onMessage(topic, message))
    this.MQTT.client.on('close',      ()               => this.logger.warn('-- MQTT: connection closed'))
    this.MQTT.client.on('error',      (e)              => this.logger.error('-- MQTT: error,', e))
  }

  onReconnect() {
    this.logger.warn('-- MQTT: reconnect')

    this.MIC.refreshCredentials().then(() => {
      this.MQTT.client.end(true)
      this.MQTT.init(MIC.AWS.config)
      this.setupEvents()
    })
    .catch(err => {
      this.logger.error('-- onReconnect: catch,', err)
    })
  }

  onConnect() {
    this.spinner.stop()
    this.logger.info('-- MQTT: connected')
    this.logger.info('-- MQTT: subscribing to', this.topic)

    this.MQTT.client.subscribe(this.topic, {qos: 1}, (err, granted) => {
      if (err) this.logger.error('-- MQTT: error in message,', err)
    })

  }

  onMessage (topic, message) {
    const data = JSON.parse(message)
    const thing_id = topic.substring(topic.length - 8, topic.length)

    console.log(thing_id)
  }
}

module.exports = MQTTClient
