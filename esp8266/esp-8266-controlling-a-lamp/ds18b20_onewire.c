/* ds18b20_onewire.c - Retrieves readings from one or more DS18B20 temperature
 * sensors, and prints the results to stdout.
 *
 * This sample code is in the public domain.,
 */

#include "FreeRTOS.h"
#include "task.h"
#include "esp/uart.h"

#include "ds18b20/ds18b20.h"
 
#define SENSOR_GPIO 13
#define MAX_SENSORS 8
#define RESCAN_INTERVAL 8
#define LOOP_DELAY_MS 250

void print_temperature(float *tempPtr) 
{
    ds18b20_addr_t addrs[MAX_SENSORS];
    float temps[MAX_SENSORS];
    int sensor_count;

    // Every RESCAN_INTERVAL samples, check to see if the sensors connected
    // to our bus have changed.
    sensor_count = ds18b20_scan_devices(SENSOR_GPIO, addrs, MAX_SENSORS);

    if (sensor_count < 1) {
        printf("\nNo sensors detected!\n");
    } else {
        printf("\n%d sensors detected:\n", sensor_count);
        // If there were more sensors found than we have space to handle,
        // just report the first MAX_SENSORS..
        if (sensor_count > MAX_SENSORS) sensor_count = MAX_SENSORS;

        // Do a number of temperature samples, and print the results.
        for (int i = 0; i < RESCAN_INTERVAL; i++) {
            ds18b20_measure_and_read_multi(SENSOR_GPIO, addrs, sensor_count, temps);
            for (int j = 0; j < sensor_count; j++) {
                
                uint32_t addr0 = addrs[j] >> 32;
                uint32_t addr1 = addrs[j];
                
                float temp_c = temps[j];
                float temp_f = (temp_c * 1.8) + 32;
                
                *tempPtr = temps[j];
                
                //printf("  Sensor %08x%08x reports %f deg C (%f deg F)\n", addr0, addr1, temp_c, temp_f);
            }

            // Wait for a little bit between each sample (note that the
            // ds18b20_measure_and_read_multi operation already takes at
            // least 750ms to run, so this is on top of that delay).
            vTaskDelay(LOOP_DELAY_MS / portTICK_PERIOD_MS);
        }
    }
}

void init_temp()
{
    gpio_set_pullup(SENSOR_GPIO, true, true);
}
