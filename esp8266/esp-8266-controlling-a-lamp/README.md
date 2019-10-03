# Connect an ESP8266 to Telenor Start IoT

This example shows you how to connect an ESP8266 to Telenor Start IoT Cloud
Connect backend by posting to the related Cloud Connect MQTT topics.

## Requirements:

Telenor Start IoT is built on top of AWS IoT and in order to securely communicate
with the underlying AWS IoT MQTT broker TLS 1.2 is required. The only environment
for the ESP8266 that (currently) supports TLS 1.2 is the esp-open-rtos (a real
time operating system for the ESP8266). The example therefore needs to be run
under this environment. You can find out how to install the toolchain for the
esp-open-rtos here:

[ESP8266 RTOS](https://github.com/SuperHouse/esp-open-rtos)

Before you try to run the example you will have to create a corresponding thing
in Telenor Start IoT Cloud Connect. How to do this will not be covered in this
Readme file. For more details about this, refer to:

[Telenor Start IoT developer site](https://startiot.telenor.com)

## Modify, build, flash and run

Please follow the steps below to build and run the example on your ESP8266.

0. Install the esp-open-rtos tool chain and place this code in the examples
 directory in the resulting folder structure (i.e. copy the telenor-start-iot
 folder to the examples folder in the esp-open-rtos file hierarchy).

1. Modify client_config.c to provide your own Telenor Start IoT account-specific
 AWS IoT endpoint, RSA-based client certificate, and private key.

2. Modify include/ssid_config.h with your Wifi access Id and credential.

4. Build and flash the example firmware to the device using the command
 below (from the esp-open-rtos main directory):

 ```sh
 $ make flash -C examples/telenor-start-iot ESPPORT=/dev/ttyUSB0
 ```

 *Note, it assumes your ESP8266 is connected through USB and exposed under
 your Linux host as /dev/ttyUSB0.* (i.e. the /dev/xxx name will be different
 on a Mac)

## Known issues
Currently it is not possible to create widgets in Cloud Connect based on "resources"
(e.g. "temperature", "humidity") that would normally be created according to the 
uplink transformation when the first LoRaWAN packet arrives. We are looking into
how to add this.

A workaround is to edit the view for the thing dashboard by pressing the pen icon, 
and then pressing the curved icon on the left of the save icon (floppy disk). This 
'Resets the current dashboard to the current resources'. Then saving the view by 
pressing the save icon.
