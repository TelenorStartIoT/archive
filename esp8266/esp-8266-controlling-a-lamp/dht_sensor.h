#include <stdio.h>
#include <stdlib.h>
#include "espressif/esp_common.h"
#include "esp/uart.h"
#include "FreeRTOS.h"
#include "task.h"
#include <dht/dht.h>
#include "esp8266.h"

void dhtMeasurementTask();
void dht_init(void);
