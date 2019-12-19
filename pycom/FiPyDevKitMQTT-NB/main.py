import socket
import ssl
import time
from network import LTE
from mqtt import MQTTClient
import config
import uos

lte = None
client = None
downlink = ""

def connect():
    global lte
    lte = LTE()         # instantiate the LTE object
    
    # Change this if you are using the M1 network (comment out the next 6 lines)
    lte.send_at_cmd('AT+CFUN=0')
    lte.send_at_cmd('AT+CEMODE=0')
    lte.send_at_cmd('AT+CEMODE?')
    lte.send_at_cmd('AT!="clearscanconfig"')
    lte.send_at_cmd('AT!="addscanfreq band=20 dl-earfcn=6352"')
    lte.send_at_cmd('AT+CFUN=1')
    # End change this ....

    lte.attach()        # attach the cellular modem to a base station
    while not lte.isattached():
        time.sleep(0.25)
    print("attatched")
    lte.connect()       # start a data session and obtain an IP address
    while not lte.isconnected():
        time.sleep(0.25)
    print("connected")

def sub_callback(topic, msg):
    print(msg)

def setup_mqtt():
    global client
    client = MQTTClient(client_id=config.CLIENT_ID, server=config.AWS_HOST, port=config.AWS_PORT,
        keepalive=10000, ssl=True, ssl_params={
            "certfile": config.AWS_CLIENT_CERT,
            "keyfile": config.AWS_PRIVATE_KEY,
            "ca_certs": config.AWS_ROOT_CA
        })

    client.set_callback(sub_callback)
    client.connect()
    client.subscribe(config.TOPIC)

def run():
    connect()
    setup_mqtt()

    while True:
        print("Sending dummy data")
        tmp = ((uos.urandom(1)[0] / 256) * 10) + 20
        hum = ((uos.urandom(1)[0] / 256) * 10) + 60
        msg = '{"state":{"reported": {"temperature":"'+ str(tmp) + '", "humidity": "'+ str(hum) + '", "latlng": "69.417383, 17.163101", "downlink": "' + downlink + '"}}}'
        client.publish(topic=config.TOPIC, msg=msg, qos=0)
        print('Sending: ' + msg)
        print()
        time.sleep(10)
        client.check_msg()
        time.sleep(10)

run()
