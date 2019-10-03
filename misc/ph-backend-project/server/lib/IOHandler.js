class IOHandler {
  constructor () {
    this.MIC = null
    this.IO = require('socket.io')(3000)
    this.buffer = {}
  }

  init (MIC) {
    this.MIC = MIC
    this.IO.on('connection', (socket) => this.onConnection(socket))
  }

  bufferPush (packet) {
    // New thing
    if (!this.buffer.hasOwnProperty(packet.topic)) {
      this.buffer[packet.topic] = [packet]
      return
    }

    // Prepend new data
    this.buffer[packet.topic].unshift(packet)

    // Buffer overflow
    if (this.buffer[packet.topic].length >= 10)
      this.buffer[packet.topic].splice(-1, 1)
  }
  
  onConnection (socket) {
    socket.emit('init', this.buffer)
    socket.on('search', (data) => this.onSearch(socket, data))
  }

  onMessage (packet) {
    this.bufferPush(packet)
    this.IO.emit('broadcast', packet)
  }

  onSearch (socket, data) {
    console.log(data)
    let payload = {
      action: 'FIND',
      query: {
        size: 1000,
        _source: ['state.timestamp', 'state.payload'],
        sort: { timestamp: { order: 'desc' } },
        filter: {
          bool: {
            must: [
              { terms: { thingName: [data.topic] } },
              { range: { timestamp: {
                gte: parseInt(new Date(data.gte).getTime()),
                lte: + Date.now()
              } } }
            ],
            minimum_should_match: 1,
            should: [
              { exists: { field: 'state.timestamp' } },
              { exists: { field: 'state.payload' } },
            ]
          } } } }

    this.MIC.invoke('ObservationLambda', payload)
      .then(data => { return data.hits.hits })
      .then(hits => {
        let tmp = {}
        tmp[data.topic] = []

        hits.map(item => {
          tmp[data.topic].push({
            timestamp: item._source.state.timestamp,
            payload: parseFloat(item._source.state.payload)
          })
        })
        socket.emit('search', tmp)
      })
      .catch(err => { return })
  }
}

module.exports = new IOHandler
