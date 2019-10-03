import pycom
from machine import UART
from network import WLAN, Bluetooth

uart = UART(0, 115200)
os.dupterm(uart)

# Disable WiFI
wlan = WLAN()
wlan.deinit()

# Disable BT
bt = Bluetooth()
bt.deinit()

# Disable heartbeat and turn off LED
pycom.heartbeat(False)
pycom.rgbled(0)
