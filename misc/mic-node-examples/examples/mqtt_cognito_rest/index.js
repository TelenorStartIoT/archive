const AWSMqtt = require('aws-mqtt-client').default
const API = require('./api.class.js')
const myApi = new API('< API KEY >')

// Insert variables
const IOT_ENDPOINT = 'a3k7odshaiipe8.iot.eu-west-1.amazonaws.com'
const AWS_REGION = 'eu-west-1'
const MQTT_TOPIC = 'thing-update/my/topic/#'
const USERNAME = ''
const PASSWORD = ''

const main = async () => {
  try {
    await myApi.init() // Init API (fetch Manifest)
    await myApi.login({
      username: USERNAME,
      password: PASSWORD
    })

    // Create a Cognito Identity before authorizing MQTT client
    let cognitoIdentity = await myApi.createCognitoIdentity(myApi.credentials.token)

    // Instantiate a new MQTT client with configurations
    let MQTTClient = new AWSMqtt({
      region: AWS_REGION,
      accessKeyId: cognitoIdentity.accessKeyId,
      secretAccessKey: cognitoIdentity.secretAccessKey,
      sessionToken: cognitoIdentity.sessionToken,
      endpointAddress: IOT_ENDPOINT,
      maximumReconnectTimeMs: 8000,
      protocol: 'wss'
    })

    // If an error occurs
    MQTTClient.on('error', e => {
      console.error('MQTT error:', e)
    })

    // If a reconnect happens
    MQTTClient.on('reconnect', async () => {
      console.error('MQTT reconnect, check topic')

      try {
        // Refresh credentials
        cognitoIdentity = await myApi.refreshCredentials()
      } catch (e) {
        console.log('Failed to refresh credentials')
      }
    })

    // Incoming message
    MQTTClient.on('message', async (topic, message) => {
      console.log('MQTT message: ', JSON.parse(message.toString('utf-8')))
    })

    // Subscribe to a topic after connect
    MQTTClient.on('connect', () => {
      console.log('Subscribed')
      MQTTClient.subscribe(MQTT_TOPIC)
    })
  } catch (e) {
    console.error('An error occured:', e)
  }
}

// Invoke our program
main()
