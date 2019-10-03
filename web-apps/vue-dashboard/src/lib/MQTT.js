import AWSMqtt from 'aws-mqtt-client'
import { MIC } from '@/lib/MIC'

class MQTTClass {
  init (ctx, topic) {
    this.ctx = ctx
    this.topic = `thing-update${topic}#`
    this.retries = 0
    this.mqtt = new AWSMqtt({
      region: MIC.manifest.Region,
      accessKeyId: MIC.AWS.config.credentials.accessKeyId,
      secretAccessKey: MIC.AWS.config.credentials.secretAccessKey,
      sessionToken: MIC.AWS.config.credentials.sessionToken,
      endpointAddress: MIC.manifest.IotEndpoint,
      maximumReconnectTimeMs: 8000,
      protocol: 'wss'
    })

    this.mqtt.on('reconnect', () => this.reconnect())
    this.mqtt.on('connect', () => this.connect())
    this.mqtt.on('close', () => this.close())
    this.mqtt.on('error', e => this.error(e))
    this.mqtt.on('message', (topic, message) => this.message(topic, message))
  }

  reconnect () {
    MIC.refresh().then(() => {
      this.retries++
      if (this.retries >= 2) {
        this.ctx.eventBus.$emit('mqtt:message', null, 'Too many retries, closing connection. Is the topic correct?')
        this.retries = 0
        this.kill()
      }
    })
      .catch(() => {
        return
      })
  }

  connect () {
    this.ctx.eventBus.$emit('mqtt:connect')
    this.subscribe(this.topic)
  }

  close () {
    this.ctx.eventBus.$emit('mqtt:close')
  }

  error (e) {
    this.ctx.eventBus.$emit('mqtt:error', e)
  }

  subscribe (topic) {
    if (this.topic !== null) {
      this.mqtt.unsubscribe(this.topic)
    }

    this.topic = topic
    this.mqtt.subscribe(topic, {qos: 1}, err => {
      if (err) {
        return
      }

      this.ctx.eventBus.$emit('mqtt:subscribe', topic)
    })
  }

  publish (topic, message) {
    return new Promise((resolve, reject) => {
      this.mqtt.publish(topic, message, {qos: 1}, (err) => {
        this.ctx.eventBus.$emit('mqtt:publish', topic, message)
        if (!err) {
          resolve()
        } else {
          reject(err)
        }
      })
    })
  }

  message (topic, message) {
    message = JSON.parse(message.toString('utf-8'))
    this.ctx.$store.dispatch('Boards/onMqttMessage', {topic, message})
  }

  kill () {
    if (this.topic !== null) {
      this.mqtt.unsubscribe(this.topic)
    }

    this.mqtt.end(true)
    this.init(this.eventBus)
  }
}

export let MQTT = new MQTTClass()
