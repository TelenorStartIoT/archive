/* 
 *
 * This sample code is in the public domain.
 */
#include <stdio.h>
#include <stdlib.h>
#include "espressif/esp_common.h"
#include "esp/uart.h"
#include "FreeRTOS.h"
#include "task.h"
#include <dht/dht.h>
#include "esp8266.h"

uint8_t const dht_gpio = 14;
const dht_sensor_type_t sensor_type = DHT_TYPE_DHT22;

void dhtMeasurementTask()
{
    int16_t temperature = 0;
    int16_t humidity = 0;

    dht_read_data(sensor_type, dht_gpio, &humidity, &temperature);
            printf("Humidity: %d%% Temp: %dC\r\n", 
                    humidity / 10, 
                    temperature / 10);
    
}

void dht_init(){
    gpio_set_pullup(dht_gpio, false, false);
}

