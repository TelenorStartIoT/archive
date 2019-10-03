/*
 * Derived from examples/mqtt_client/mqtt_client.c - added TLS1.2 support and some minor modifications.
 */
#include "espressif/esp_common.h"
#include "esp/uart.h"

#include <string.h>
#include "esp/gpio.h"
#include <FreeRTOS.h>
#include <task.h>
#include <queue.h>
#include <ssid_config.h>
#include <dht/dht.h>
#include "temp.h"


#include <espressif/esp_sta.h>
#include <espressif/esp_wifi.h>

#include <paho_mqtt_c/MQTTESP8266.h>
#include <paho_mqtt_c/MQTTClient.h>

// this must be ahead of any mbedtls header files so the local mbedtls/config.h can be properly referenced
#include "ssl_connection.h"

#define MQTT_PUB_TOPIC "$aws/things/00000570/shadow/update"
#define MQTT_SUB_TOPIC "$aws/things/00000570/shadow/update"
#define MQTT_MSG "{\"state\":{\"reported\":{\"latlng\":\"69.6527,18.9291\",\"string_value\":\"ESP8266\"}}}"
#define MQTT_CLIENTID "00000570"
#define GPIO_RELAY 13
#define MQTT_PORT 8883
#define RELE_ON_MARKER "LAMP_ON"

/* certs, key, and endpoint */
extern char *ca_cert, *client_endpoint, *client_cert, *client_key;

static int wifi_alive = 0;
static int ssl_reset;
static SSLConnection *ssl_conn;
static QueueHandle_t publish_queue;

static void beat_task(void *pvParameters) {
    char msg[16];
    int count = 0;

    while (1) {
        if (!wifi_alive) {
            vTaskDelay(1000 / portTICK_PERIOD_MS);
            continue;
        }

        printf("Schedule to publish\r\n");

        snprintf(msg, sizeof(msg), "%d", count);
        printf("beat_task: xQueueSend msg is %s\r\n", msg);

        if (xQueueSend(publish_queue, (void *) msg, 0) == pdFALSE) {
            printf("Publish queue overflow\r\n");
        }

        vTaskDelay(10000 / portTICK_PERIOD_MS);
    }
}

static void topic_received(mqtt_message_data_t *md) {
    mqtt_message_t *message = md->message;
    int i;
    
    char *buffer = message->payload;
    for (i = 0; i < (int)message->payloadlen - strlen(RELE_ON_MARKER); i++, buffer++) {
        if (!strncmp(buffer, RELE_ON_MARKER, strlen(RELE_ON_MARKER))) {
            printf("Found on %dth place: %c\n", i, (buffer + strlen(RELE_ON_MARKER))[3]);
            char value = (buffer + strlen(RELE_ON_MARKER))[3];
            if (value == '1') {
                gpio_write(GPIO_RELAY, 1);
            } else if (value == '0') {
                gpio_write(GPIO_RELAY, 0);
            }
        }
    }
}

static int mqtt_ssl_read(mqtt_network_t * n, unsigned char* buffer, int len,
        int timeout_ms) {
    int r = ssl_read(ssl_conn, buffer, len, timeout_ms);
    if (r <= 0
            && (r != MBEDTLS_ERR_SSL_WANT_READ
                    && r != MBEDTLS_ERR_SSL_WANT_WRITE
                    && r != MBEDTLS_ERR_SSL_TIMEOUT)) {
        printf("%s: TLS read error (%d), resetting\n\r", __func__, r);
        ssl_reset = 1;
    };
    return r;
}

static int mqtt_ssl_write(mqtt_network_t* n, unsigned char* buffer, int len,
        int timeout_ms) {
    int r = ssl_write(ssl_conn, buffer, len, timeout_ms);
    if (r <= 0
            && (r != MBEDTLS_ERR_SSL_WANT_READ
                    && r != MBEDTLS_ERR_SSL_WANT_WRITE)) {
        printf("%s: TLS write error (%d), resetting\n\r", __func__, r);
        ssl_reset = 1;
    }
    return r;
}

static void mqtt_task(void *pvParameters) {
    int ret = 0;
    struct mqtt_network network;
    mqtt_client_t client = mqtt_client_default;
    char mqtt_client_id[20];
    uint8_t mqtt_buf[1000];
    uint8_t mqtt_readbuf[1000];
    mqtt_packet_connect_data_t data = mqtt_packet_connect_data_initializer;

    memset(mqtt_client_id, 0, sizeof(mqtt_client_id));
    strcpy(mqtt_client_id, MQTT_CLIENTID);
    //strcat(mqtt_client_id, get_my_id());
    
    ssl_conn = (SSLConnection *) malloc(sizeof(SSLConnection));
    while (1) {
        if (!wifi_alive) {
            vTaskDelay(1000 / portTICK_PERIOD_MS);
            continue;
        }
        
        printf("%s: started\n\r", __func__);
        ssl_reset = 0;
        ssl_init(ssl_conn);
        ssl_conn->ca_cert_str = ca_cert;
        ssl_conn->client_cert_str = client_cert;
        ssl_conn->client_key_str = client_key;

        mqtt_network_new(&network);
        network.mqttread = mqtt_ssl_read;
        network.mqttwrite = mqtt_ssl_write;

        printf("%s: connecting to MQTT server %s ... ", __func__,
                client_endpoint);
        ret = ssl_connect(ssl_conn, client_endpoint, MQTT_PORT);

        if (ret) {
            printf("error: %d\n\r", ret);
            ssl_destroy(ssl_conn);
            continue;
        }
        printf("done\n\r");
        mqtt_client_new(&client, &network, 5000, mqtt_buf, 1000, mqtt_readbuf,
                1000);

        data.willFlag = 0;
        data.MQTTVersion = 4;
        data.cleansession = 1;
        data.clientID.cstring = mqtt_client_id;
        data.username.cstring = NULL;
        data.password.cstring = NULL;
        data.keepAliveInterval = 1000;
        printf("Send MQTT connect ... ");
        ret = mqtt_connect(&client, &data);
        if (ret) {
            printf("error: %d\n\r", ret);
            ssl_destroy(ssl_conn);
            continue;
        }
        printf("done\r\n");
        mqtt_subscribe(&client, MQTT_SUB_TOPIC, MQTT_QOS1, topic_received);
        xQueueReset(publish_queue);

        while (wifi_alive && !ssl_reset) {
            char msg[128];
                        
            while (xQueueReceive(publish_queue, (void *) msg, 0) == pdTRUE) {
                snprintf(msg, 128, "{\"state\":{\"reported\":{\"latlng\":\"69.6527,18.9291\",\"temperature\":\"%f\"}}}", 23.0);
                                
                printf("Publishing: %s\r\n", msg);
                                               
                mqtt_message_t message;
                message.payload = msg;
                message.payloadlen = strlen(msg);
                message.dup = 0;
                message.qos = MQTT_QOS1;
                message.retained = 0;
                ret = mqtt_publish(&client, MQTT_PUB_TOPIC, &message);
                if (ret != MQTT_SUCCESS) {
                    printf("error while publishing message: %d\n", ret);
                    break;
                }
            }

            ret = mqtt_yield(&client, 1000);
            if (ret == MQTT_DISCONNECTED)
                break;
        }
        printf("Connection dropped, request restart\n\r");
        ssl_destroy(ssl_conn);
    }
}

static void wifi_task(void *pvParameters) {
    uint8_t status = 0;
    uint8_t retries = 30;
    struct sdk_station_config config = { .ssid = WIFI_SSID, .password =
            WIFI_PASS, };

    printf("%s: Connecting to WiFi\n\r", __func__);
    sdk_wifi_set_opmode (STATION_MODE);
    sdk_wifi_station_set_config(&config);

    while (1) {
        wifi_alive = 0;

        while ((status != STATION_GOT_IP) && (retries)) {
            status = sdk_wifi_station_get_connect_status();
            printf("%s: status = %d\n\r", __func__, status);
            if (status == STATION_WRONG_PASSWORD) {
                printf("WiFi: wrong password\n\r");
                break;
            } else if (status == STATION_NO_AP_FOUND) {
                printf("WiFi: AP not found\n\r");
                break;
            } else if (status == STATION_CONNECT_FAIL) {
                printf("WiFi: connection failed\r\n");
                break;
            }
            vTaskDelay(1000 / portTICK_PERIOD_MS);
            --retries;
        }

        while ((status = sdk_wifi_station_get_connect_status())
                == STATION_GOT_IP) {
            if (wifi_alive == 0) {
                printf("WiFi: Connected\n\r");
                wifi_alive = 1;
            }
            vTaskDelay(500 / portTICK_PERIOD_MS);
        }

        wifi_alive = 0;
        printf("WiFi: disconnected\n\r");
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}

void user_init(void) {
    uart_set_baud(0, 115200);
    printf("SDK version: %s, free heap %u\n", sdk_system_get_sdk_version(),
            xPortGetFreeHeapSize());

    gpio_enable(GPIO_RELAY, GPIO_OUTPUT);
    gpio_write(GPIO_RELAY, 1);

    publish_queue = xQueueCreate(3, 16);
    xTaskCreate(&wifi_task, "wifi_task", 256, NULL, 2, NULL);
    xTaskCreate(&beat_task, "beat_task", 256, NULL, 2, NULL);
    xTaskCreate(&mqtt_task, "mqtt_task", 2048, NULL, 2, NULL);
}
