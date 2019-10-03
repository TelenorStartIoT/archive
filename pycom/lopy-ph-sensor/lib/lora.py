import binascii
import socket
from network import LoRa
from time import sleep

class LORA(object):
  'Wrapper class with credentials to connect to LoRa'
  
  # LoRa and socket instances
  lora = None
  s = None
  
  def connect(self, dev_eui, app_eui, app_key):
    """
    Connect device to LoRa.
    Set the socket and lora instances.
    """
    
    dev_eui = binascii.unhexlify(dev_eui)
    app_eui = binascii.unhexlify(app_eui)
    app_key = binascii.unhexlify(app_key)

    # Initialize LoRa in LORAWAN mode
    self.lora = LoRa(mode = LoRa.LORAWAN)

    # Join a network using OTAA (Over the Air Activation)
    self.lora.join(activation = LoRa.OTAA, auth = (dev_eui, app_eui, app_key), timeout = 0)

    # Wait until the module has joined the network
    count = 0
    while not self.lora.has_joined():
      print("Trying to join: " ,  count)
      count = count + 1
      sleep(2.5)

    # Create a LoRa socket
    self.s = socket.socket(socket.AF_LORA, socket.SOCK_RAW)

    # Set the LoRaWAN data rate
    self.s.setsockopt(socket.SOL_LORA, socket.SO_DR, 5)

    # Make the socket non-blocking
    self.s.setblocking(False)

    print ("Joined! ",  count)
    print("Create LoRaWAN socket")

    # Create a raw LoRa socket
    self.s = socket.socket(socket.AF_LORA, socket.SOCK_RAW)
    self.s.setblocking(False)
      
  def send(self, data):
    """
    Send data over the network.
    """
    
    try:
      self.s.send(data)
      print("Sending data:")
      print(data)
    except OSError as e:
      if e.errno == 11:
        print("Caught exception while sending")
        print("errno: ", e.errno)
    
    data = self.s.recv(64)
    print("Received data:", data)

    return data
