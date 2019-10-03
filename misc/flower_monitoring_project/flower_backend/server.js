var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cors = require('cors')

var MQTT = require('./mqttclient.js')
var Flower = require('./flower.js').flower
var FlowerSeries = require('./flower.js').flowerSeries

io.on('connection', function(socket){
  console.log('a user connected');
});

var mqttClient = new MQTT({
   username: "tholden",
   password: "nzkPiDU8", 
   topic: "thing-update/StartIoT/#",
   socket: io,
   onMessage: function(topic, message){
      const data = JSON.parse(message)
      const thing_id = topic.substring(topic.length - 8, topic.length)

      var flowerseries = new FlowerSeries({
         Timestamp: + new Date(),
         ThingId: thing_id,
         State: {
            humidity: data.state.reported.value,
            rssi: data.state.reported.tcxn.cellular.rssi,
            lsnr: data.state.reported.lsnr,
            latlng: data.state.reported.latlng
         }
      })

      flowerseries.save(function(err, series){
         if(!err){
            console.log("FlowerSeries saved")
         }
      })

      Flower.find({ThingId: thing_id}, (err, flower) => {
         if( flower.length ) 
         {
            Flower.update({ ThingId: thing_id }, { $set: 
               { 
                  Last_heard_from: + new Date(),
                  State: {
                     humidity: data.state.reported.value,
                     rssi: data.state.reported.tcxn.cellular.rssi,
                     lsnr: data.state.reported.lsnr,
                     latlng: data.state.reported.latlng
                  }
               }}, 
            function(){
               console.log("Flower updated")
            });
         }
         else 
         {
            var newFlower = new Flower({
               Title: "Gi meg et navn",
               ThingId: thing_id,
               Last_heard_from: + new Date(),
               State: {
                  humidity: data.state.reported.value,
                  rssi: data.state.reported.tcxn.cellular.rssi,
                  lsnr: data.state.reported.lsnr,
                  latlng: data.state.reported.latlng
               }
            })

            newFlower.save(function(err, flower){
               if(!err){
                  console.log("New flower created \n")
               }
            })
         }
     })
   }
})


app.use(cors())

// This responds with "Hello World" on the homepage
app.get('/flowers', function (req, res) {
   console.log("Got a GET request for the homepage");
   
   Flower.find(function(err, flowers){
      res.send(JSON.stringify(flowers));
   })
})

// This responds a GET request for abcd, abxcd, ab123cd, and so on
app.get('/flowertime', function(req, res) {   

   console.log(req.query)

   FlowerSeries.find({ ThingId: req.query.ThingId }, function(err, time){
      res.send(JSON.stringify(time))
   })
})

var server = app.listen(8081, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})
