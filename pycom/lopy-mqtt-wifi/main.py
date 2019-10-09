from network import WLAN
from simple import MQTTClient
import machine
import time
import config
import ujson

DISCONNECTED = 0
CONNECTING = 1
CONNECTED = 2

state = DISCONNECTED
connection = None

wlan = WLAN(mode=WLAN.STA)
wlan.antenna(WLAN.INT_ANT)

def pub_msg(msg):
  global connection

  connection.publish(topic=config.TOPIC, msg=msg, qos=0)
  print('Sending: ' + msg)

def _recv_msg_callback(topic, msg):
  print("Received: {} from Topic: {}".format(msg, topic))

def run():
  global state, connection

  while True:
    while state != CONNECTED:
      try:
        state = CONNECTING
        connection = MQTTClient(client_id=config.CLIENT_ID, server=config.AWS_HOST, port=config.AWS_PORT,
                                keepalive=10000, ssl=True, ssl_params={
                                  "certfile": config.AWS_CLIENT_CERT,
                                  "keyfile": config.AWS_PRIVATE_KEY,
                                  "ca_certs": config.AWS_ROOT_CA
                                })
        connection.connect()
        state = CONNECTED
      except:
        print('Could not establish MQTT connection')
        time.sleep(0.5)
        continue

    print('MQTT LIVE!')

    # Subscribe for messages
    connection.set_callback(_recv_msg_callback)
    connection.subscribe(config.TOPIC)

    while state == CONNECTED:
      try:
        connection.check_msg()
      except:
        pass
      time.sleep(0.1)

nets = wlan.scan()
for net in nets:
  if net.ssid == config.WIFI_SSID:
    print(net.ssid +" was found!")
    wlan.connect(net.ssid, auth=(WLAN.WPA2, config.WIFI_PASS), timeout=5000)
    
    while not wlan.isconnected():
      machine.idle()
    print('Connected to '+ net.ssid)
    run()
    break
