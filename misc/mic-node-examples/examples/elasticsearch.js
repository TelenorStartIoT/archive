let MIC = require('mic-sdk-js').default

const CONFIG = {
  // Username of the Cognito user
  username: '',
  // Password of the Cognito user
  password: '',
  // The application endpoint
  app:      'startiot.mic.telenorconnexion.com',
  // Elasticsearch query
  query: {
    size: 100,
    query: {
      bool: {
        filter: {
          bool: {
            minimum_should_match: 1,
            must: [
              {
                terms: {
                  thingName: ['00000217']
                }
              },
              {
                range: {
                  timestamp: {
                    gte: '2017-11-15T22:00:00.000Z',
                    lte: '2017-11-24T13:57:20.766Z'
                  }
                }
              }
            ],
            should: [{
              exists: {
                field: 'state.temperature'
              }
            }]
          }
        },
        sort: {
          timestamp: {
            order: 'desc'
          }
        },
        _source: ['state.temperature', 'timestamp']
      }
    }
  }
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
        console.log(user)
        
        // Invoke ObservationLambda FIND with a query payload
        api.invoke('ObservationLambda', { action: 'FIND', query: CONFIG.query })
        .then(res => {
          console.log('Result: ', res)
          // To display all information:
          // console.log(JSON.stringify(res, 0, 2))
        })

      })
  })
  .catch(err => console.error(err))
