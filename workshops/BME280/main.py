#from display import SSD1306
from machine import I2C
from bme280 import BME280
from network import LoRa
import socket
from time import sleep
import binascii
import pycom

pycom.heartbeat(False) # disable the blue blinking
pycom.rgbled(0x000000) #LED off

# Initialize LoRa in LORAWAN mode.
lora = LoRa(mode=LoRa.LORAWAN, tx_retries=1, adr=False)
# create an OTAA authentication parameters
dev_eui = binascii.unhexlify("00000000000000d9")
app_eui = binascii.unhexlify("0000000000000034")
app_key = binascii.unhexlify("416778584b3331314643764539425758")

# join a network using OTAA (Over the Air Activation)
lora.join(activation=LoRa.OTAA, auth=(dev_eui, app_eui, app_key), timeout=0)

# wait until the module has joined the network
count = 0
while not lora.has_joined():
	pycom.rgbled(0xff0000)
	sleep(2)
	pycom.rgbled(0x000000)
	sleep(0.5)
	print("Not yet joined count is: %s" % count)
	count = count + 1

print ("After while, count is: ",  count)

print("Create LoRaWAN socket")

# create a LoRa socket
pycom.rgbled(0x0000ff)
sleep(0.1)
pycom.rgbled(0x000000)
sleep(0.1)
pycom.rgbled(0x0000ff)
sleep(0.1)
pycom.rgbled(0x000000)

s = socket.socket(socket.AF_LORA, socket.SOCK_RAW)

# set the LoRaWAN data rate
s.setsockopt(socket.SOL_LORA, socket.SO_DR, 5)

# make the socket non-blocking
s.setblocking(False)

# create a raw LoRa socket
#s = socket.socket(socket.AF_LORA, socket.SOCK_RAW)
#s.setblocking(False)

# Set up weather sensor
i2c=I2C(0)
weather = BME280(i2c=i2c)

# Set up display
#display = SSD1306(height=64, external_vcc=False, i2c_devid=60)
#display.poweron()
#display.init_display()
#display.contrast(0x00)
#display.init_font()

every = 60
current = 0

while True:
	sleep(1)
	#display.clear()
	#display.write_string(0,0,weather.temperature)
	#display.write_string(0,9,weather.humidity)
	#display.write_string(0,18,weather.pressure)
	#display.display()
	current+=1
	if current==every:
		print("Send data...")
		#data = "%s %s %s" % (weather.temperature,weather.humidity,weather.pressure)
		t = weather.read_temperature()
		p = weather.read_pressure()
		h = weather.read_humidity()
		data = "{\"temp\":%.2f, \"humi\":%.2f, \"pres\":%.2f}" % (t/100,h/1024,p/25600)
		# send some data
		try:
			s.send(data)
		except OSError as e:
			# Check for EAGAIN
			if e.args[0]==11:
				print("EAGAIN error, retrying")
				current-=10
				continue

		pycom.rgbled(0x00ff00)
		sleep(0.1)
		pycom.rgbled(0x000000)
		sleep(0.1)
		pycom.rgbled(0x00ff00)
		sleep(0.1)

		pycom.rgbled(0x000000)
		print("Sending data done (RSSI: %s)..." % lora.rssi())
		# get any data received...
		data = s.recv(64)
		print("Received Data (RSSI: %s): %s" % (lora.rssi(), data))
		current-=every

