let MIC = require('mic-sdk-js').default
let AWSMqtt = require('aws-mqtt-client').default

const CONFIG = {
  // Username of the Cognito user
  username: '',
  // Password of the Cognito user
  password: '',
  // The application endpoint
  app:      'startiot.mic.telenorconnexion.com',
  // The MQTT topic, wildcards can be used (case sensitive)
  topic:    'thing-update/My/Domain/#'
}

// Instantiate a new Managed IoT Cloud API object
let api = new MIC

// Init by providing the app endpoint
api.init(CONFIG.app)

  // The manifest is fetched and a 'unauthorized'
  // Cognito identity is created
  .then((manifest, credentials) => {

    // Login the Cognito user
    return api.login(CONFIG.username, CONFIG.password)
      .then(user => {
        
        // Init MQTT client with Cognito credentials
        let mqtt = new AWSMqtt({
          region:                 manifest.Region,
          accessKeyId:            api._AWS.config.credentials.accessKeyId,
          secretAccessKey:        api._AWS.config.credentials.secretAccessKey,
          sessionToken:           api._AWS.config.credentials.sessionToken,
          endpointAddress:        manifest.IotEndpoint,
          maximumReconnectTimeMs: 8000,
          protocol:               'wss' // Websockets
        })

        mqtt.on('connect', () => {
          console.log('Connecting to topic')
          mqtt.subscribe(CONFIG.topic, {qos: 1}, (err, granted) => {
            if (err)
              console.log(err)
            console.log('Connected!')
          })
        })

        mqtt.on('message', (topic, message) => {
          console.log('Message: ', topic, message.toString())
        })

      })
  })
  .catch(err => console.error(err))
