from lora import LORA
from config import dev_eui, app_eui, app_key
from time import sleep
from pysense import Pysense
from machine import ADC

# Formula is calculated using calibration fluids
def magicFormula(val):
  return 20.2489 - (0.00452489 * val)

try:
  adc = ADC()
  pin = adc.channel(pin='P13', attn=ADC.ATTN_11DB)
except Exception:
  pass

# Connect to LoRaWAN
n = LORA()
n.connect(dev_eui, app_eui, app_key)

# Send value
val = pin()
tmp = "%.2f" % magicFormula(val)
n.send(tmp)

py = Pysense()
py.setup_sleep(1200) # 20 min
py.go_to_sleep()
