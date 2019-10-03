var mongoose = require('mongoose')
var Schema = mongoose.Schema

mongoose.connect('mongodb://localhost/flowers', {
	  useMongoClient: true,
});

mongoose.Promise = global.Promise;

var flowerSchema = new Schema({
	Title: String,
	ThingId: String,
	Last_heard_from: Number,
	State: {
		humidity: Number,
		latlng: String,
		rssi: Number,
		lsnr: Number
	},

})

var flowerTimeSeriesSchema = new Schema({
	ThingId: String,
	Timestamp: Number,
	State: {
		humidity: Number,
		latlng: String,
		rssi: Number,
		lsnr: Number
	}
})


var flower = mongoose.model('Flower', flowerSchema)
var flowerSeries = mongoose.model('FlowerSeries', flowerTimeSeriesSchema)

module.exports = {
	flower: flower,
	flowerSeries: flowerSeries
}