var MIC = require('mic-sdk-js').default;
var api = new MIC;

var query = {
  size: 100,
  filter: {
    bool: {
      minimum_should_match: 1,
      must: [
        {
          terms: {
            thingName: ['00000569']
          }
        },
        {
          range: {
            timestamp: {
              gte: '2017-06-21T22:00:00.000Z',
              lte: '2017-06-29T13:57:20.766Z'
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
};

// Init by providing the endpoint for your app
api.init('startiot.mic.telenorconnexion.com')
.then((manifest, credentials) => {
  // Login a user
  api.login('USERNAME', '*********')
  .then(user => {
    // Invoke ObservationLambda FIND with a query payload
    api.invoke('ObservationLambda', { action: 'FIND', query: query })
    .then(res => {
      console.log('Result: ', res)
    })
  });
})
.catch(err => console.log('Error: ', err));
