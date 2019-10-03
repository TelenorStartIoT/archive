let awsIot = require('aws-iot-device-sdk');
 
let thingName = '00000217';
 
let device = awsIot.device({
   keyPath: './certs/privkey.pem', // Download from MIC dashboard
  certPath: './certs/cert.pem',    // Download from MIC dashboard
    caPath: './certs/ca.pem',      // AWS IoT CA file, download from https://www.symantec.com/content/en/us/enterprise/verisign/roots/VeriSign-Class%203-Public-Primary-Certification-Authority-G5.pem
  clientId: thingName,
      host: 'a31ovqfkmg1ev8.iot.eu-west-1.amazonaws.com' // 'IotEndpoint' in the manifest, but we don't have a manifest here so it's hard-coded
});

// When the MQTT client connects, subscribe to the thing topic
device.on('connect', () => {
  console.log('Client connected');
  device.subscribe('$aws/things/' + thingName + '/shadow/update');
});
 
device.on('message', (topic, message) => {
  console.log('Message: ', topic, message.toString());
});
