# AWS general configuration
AWS_PORT = 8883
AWS_HOST = 'a3k7odshaiipe8-ats.iot.eu-west-1.amazonaws.com'
#AWS_HOST = 'a3k7odshaiipe8.iot.eu-west-1.amazonaws.com'
AWS_ROOT_CA = '/flash/cert/root.pem'
AWS_CLIENT_CERT = '/flash/cert/cert.pem'
AWS_PRIVATE_KEY = '/flash/cert/privkey.pem'

# Thing configuration (Change to reflect your thing in MIC and uncomment the lines)
#TOPIC = "$aws/things/00001721/shadow/update"
#DOWNLINK_TOPIC = "$aws/things/00001721/shadow/update"
#CLIENT_ID = "00001721"
