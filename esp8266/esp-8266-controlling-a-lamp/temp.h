#include "FreeRTOS.h"
#include "task.h"
#include "esp/uart.h"

#include "ds18b20/ds18b20.h"

void print_temperature(float *tempPtr);
void init_temp();
