const opts = require('./cc_options');
const cc = new (require('cloud-connect'))(opts);
const logger = require('winston');

cc.init().then(() => {
	
	cc.mqtt.on('connect', () => {
		logger.info('--- subscribing to ', opts.topic);
		cc.mqtt.subscribe(opts.topic);
	});
	
	cc.mqtt.on('message', (topic, message) => {
		logger.info('Message received: ', message.toString());
		
		/* Publish to publish topic */
		/*cc.mqtt.publish(opts.topic_publish, JSON.stringify({
			state: {
				desired: {
					foo: 'bar'
				}
			}
		}));*/
	});

});
