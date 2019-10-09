from startiot import Startiot
import pycom
from time import sleep
from machine import Pin

pycom.heartbeat(False)
iot = Startiot()
iot.connect(False)

pir = Pin('P23', mode=Pin.IN, pull=Pin.PULL_DOWN)

state = False

while True:
  val = pir()
  print('Value:', val)
  
  if state == False:
    if val == 1:
      state = True
      iot.send('MOTION,1')
      sleep(60)
  else:
    if val == 0:
      state = False

  sleep(0.1)
