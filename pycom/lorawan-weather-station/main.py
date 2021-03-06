from config import dev_eui, app_eui, app_key
from lora import LORA
from davis7911 import DAVIS7911
from machine import I2C
from bme280 import BME280
from time import sleep

def setup():
  global n, sensor_davis, sensor_bme280, sleep_time

  # Initial sleep time
  sleep_time = 30

  # Connect to LoRaWAN
  n = LORA()
  n.connect(dev_eui, app_eui, app_key)

  # Connect Sensors
  try:
    i2c = I2C(0)
    sensor_bme280 = BME280(i2c = i2c)
    sensor_davis = DAVIS7911()
  except Exception as e:
    print("Error: ", e)
  print("Setup... done")

if __name__ == "__main__":

  # Setup network & sensors
  setup()

  while True:
    sleep(sleep_time)

    data = ""

    # Measure
    try:
      bme280_data = sensor_bme280.read_compensated_data()
      t = bme280_data[0] / 100
      p = bme280_data[1] / 25600
      h = bme280_data[2] / 1024
      s = sensor_davis.get_windspeed()
      d = sensor_davis.get_dir()

      data = "%s %s %s %.1f %s" % (t, p, h, s, d)
    except Exception as e:
      print("Measure error: ", e)

    # Send packet
    response = n.send(data)
