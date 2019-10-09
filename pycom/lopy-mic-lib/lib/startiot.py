from network import LoRa
import socket
import binascii
import pycom


class Startiot:

    def __init__(self):
        self.dev_eui = binascii.unhexlify("YOUR DEV_EUI")
        self.app_eui = binascii.unhexlify("YOUR APP_EUI")
        self.app_key = binascii.unhexlify("YOUR APP_KEY")

        self.lora = LoRa(mode=LoRa.LORAWAN)

    def connect(self, timeout=0, function=None, blocking=False):
        self.lora.nvram_restore()
        if not self.lora.has_joined():
            # No saved connetion state
            pycom.rgbled(0x0f0000)
            self.lora.join(activation=LoRa.OTAA, auth=(
                self.dev_eui, self.app_eui, self.app_key), timeout=0)

            if timeout == 0:
                while not self.lora.has_joined():
                    if function == None:
                        sleep(2.5)
                    else:
                        function()
            else:
                for x in range(timeout):
                    if self.lora.has_joined():
                        break
                    if function == None:
                        sleep(2.5)
                    else:
                        function()

            if not self.lora.has_joined():
                return False

            pycom.rgbled(0x000000)
        else:
            # Connection state restored
            pycom.rgbled(0x0000ff)
            pass

        self.lora.nvram_save()
        self.s = socket.socket(socket.AF_LORA, socket.SOCK_RAW)

        # set the LoRaWAN data rate
        self.s.setsockopt(socket.SOL_LORA, socket.SO_DR, 5)

        # make the socket non-blocking
        self.s.setblocking(blocking)

        pycom.rgbled(0x000000)

        return True

    def send(self, data):
        self.s.setblocking(True)
        self.s.send(data)

    def recv(self, length=64):
        self.s.setblocking(False)
        return self.s.recv(length)
