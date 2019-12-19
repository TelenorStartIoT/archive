# FiPyDevKitMQTT-NB
Pycom FiPy MQTT over NB-IoT example. The example sends data over MQTT/TLS 1.2 to Telenor Start IoT Managed IoT Cloud (MIC). The required certificates and key is generated when you create a Thing in MIC and can be downloaded from MIC. The code in the repository has been tested in Telenor Norway´s NB-IoT network.

# Prerequsite
  - Install (flash) the Sequans NB-IoT modem firmware to the FiPy: https://docs.pycom.io/tutorials/lte/nb-iot.html
  
# Network related code changes
The code in the repository reflects settings for Telenor Norway´s NB-IoT network. If your device will connect to a different network you will have to make some changes in lib/startnbiot.py to reflect this:

Change band (from 20 to the band you are using), earfcn (from 6352 to your networks earfcn), APN name (from telenor.iot to your APN name) and network shortname (from 24201 to your networks shortname) in the following code lines:

        self.send_at_cmd_pretty('AT!="addscanfreq band=20 dl-earfcn=6352"')
        self.send_at_cmd_pretty('AT+CGDCONT=1,"IP","telenor.iot"')
        self.send_at_cmd_pretty('AT+COPS=1,2,"24201"')

# Managed IoT Cloud related code changes
## Change the MIC instance setup
The code in the repository sends data to Telenor Start IoT Managed IoT Cloud Platform (MIC). MIC is built on top of AWS IoT. If you want to send to another instance of MIC you will have to change these lines in config.py to reflect this:

        AWS_PORT = 8883
        AWS_HOST = 'a3k7odshaiipe8-ats.iot.eu-west-1.amazonaws.com'
        
 ## Change the MIC thing configuration
 Download and store the cert.pem, privkey.pem and pubkey.pem for your thing in Managed IoT Cloud to the cert folder
 
 Make changes in config.py to reflect your thing in MIC (i.e. change 00001721 to your Thing´s ID):

        TOPIC = "$aws/things/00001721/shadow/update"
        DOWNLINK_TOPIC = "$aws/things/00001721/shadow/update"
        CLIENT_ID = "00001721"

