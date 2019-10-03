// This file was tested as a client config for Cloud Connect thing 00000288
// I changed the message in mqtt pub to:
// snprintf(msg, sizeof(msg), "{\"state\":{\"reported{":{\"temperature\": \"25\",}}}\");
// Also changed client id: strcpy(mqtt_client_id, "00000205"); in mqtt_task 
// and MQTT_PUB_TOPIC to "$aws/things/00000205/shadow/update"
// but did not work. error in serial monitor is: mqtt_ssl_read: TLS read error (-30848))
// I have no idea what that means but obviously it did not work...
// The certificat and key below is what I got from Cloud Connect.

// AWS IoT client endpoint
const char *client_endpoint = "a3k7odshaiipe8.iot.eu-west-1.amazonaws.com";

// AWS IoT device certificate (RSA)
const char *client_cert =
"-----BEGIN CERTIFICATE-----\r\n"
"MIIDWjCCAkKgAwIBAgIVAK4WznFrSwx6XzDblbJJfSHw2KK6MA0GCSqGSIb3DQEB\r\n"
"CwUAME0xSzBJBgNVBAsMQkFtYXpvbiBXZWIgU2VydmljZXMgTz1BbWF6b24uY29t\r\n"
"IEluYy4gTD1TZWF0dGxlIFNUPVdhc2hpbmd0b24gQz1VUzAeFw0xNzA2MjcxMTM3\r\n"
"MTNaFw00OTEyMzEyMzU5NTlaMB4xHDAaBgNVBAMME0FXUyBJb1QgQ2VydGlmaWNh\r\n"
"dGUwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCOzyYn7m9wCujxqU0g\r\n"
"L8pa89AUnrwulLPFfoDrCWTeGRCDHHNeoXhcuxaPQYb7hYCEAzL+M1rt52yX3/NJ\r\n"
"LXtPJ3u/aaQRsBA0r4nQNmpH1CY0k2et5Hhn3bm7ln0oc44PXaNATPg/YEIfjjiQ\r\n"
"3EYzKnrXSoxLLdZLxEmYfEKFT1rDOS5H+BV+/AKtcm939Q1pBxjqbMgyhYBzgfo/\r\n"
"zHQFeiQ22aklCh9TY+swQzl20gJfCVDvO5o3PMJhTmP1ONmIzXzVJ2cm896iQrAY\r\n"
"x6imD3KGYSj36/sW72cXiA4oK2oY6RHQrzfrT7Tlqw5sf9egdO3PZgIc/YQKzIyl\r\n"
"s8zXAgMBAAGjYDBeMB8GA1UdIwQYMBaAFDaJfj3bhnWEXDhfQJhPqQHEVWUZMB0G\r\n"
"A1UdDgQWBBTpElNVLxWVc/XcnRxa/4YHdEZSTzAMBgNVHRMBAf8EAjAAMA4GA1Ud\r\n"
"DwEB/wQEAwIHgDANBgkqhkiG9w0BAQsFAAOCAQEAXayz0FiLQ9ycFvQC6rhAKJHj\r\n"
"NZgzKXWx9BiL5shTEMvPgrcD3a8ofLyvP/XmBq0S3lQ1Pa2MUhKF413X46V0uaEq\r\n"
"0gJfHSLjTMW21UDsMC92rlbc0BnKgIrdD7si8S3qM+PCGq5GsqqLwYzR9T+uMYbS\r\n"
"k5W+EzcQ+WAAF4IrTOOq8+MVE/EyxnbkGMUa97tn35kiYB+H1bdH5/vtMAoDiSO9\r\n"
"gTicjMJxZjE0QhapulzcmCMzS9KXMDooDEeexH+Hpj5qiAYBXHCQu026G28IuTw+\r\n"
"k/BDIhUVjSRUzqa7zMFm80ONBnf5nc+xTen3Gm3DivIcIa00YOxuz5WV74wIEQ==\r\n"
"-----END CERTIFICATE-----\r\n";


// AWS IoT device private key (RSA)
const char *client_key = 
"-----BEGIN RSA PRIVATE KEY-----\r\n"
"MIIEpAIBAAKCAQEAjs8mJ+5vcAro8alNIC/KWvPQFJ68LpSzxX6A6wlk3hkQgxxz\r\n"
"XqF4XLsWj0GG+4WAhAMy/jNa7edsl9/zSS17Tyd7v2mkEbAQNK+J0DZqR9QmNJNn\r\n"
"reR4Z925u5Z9KHOOD12jQEz4P2BCH444kNxGMyp610qMSy3WS8RJmHxChU9awzku\r\n"
"R/gVfvwCrXJvd/UNaQcY6mzIMoWAc4H6P8x0BXokNtmpJQofU2PrMEM5dtICXwlQ\r\n"
"7zuaNzzCYU5j9TjZiM181SdnJvPeokKwGMeopg9yhmEo9+v7Fu9nF4gOKCtqGOkR\r\n"
"0K8360+05asObH/XoHTtz2YCHP2ECsyMpbPM1wIDAQABAoIBAB/XJ9a3XrlIdW+M\r\n"
"I9oNTbzBp58xVRu9o+dgsTW2PnsWc4wIB+ENd1yVig4eug3SUjkczX3HzXpFovyp\r\n"
"vgCO13NqhjjDQQWAj9xvVvbJayDguDP4uaEX05C06vhcMUOXoBDk+8UWZDMdLyEC\r\n"
"ALKrqis2SXU+9dC9Q45ZEV+iNOKr2wfEBfvQyenRzvieyArbfpBi0hner49nJ8/9\r\n"
"AWzFzfmq5fVeFcz0j71AVgp4tCjLVB0jFIuKh5V+FvfIzXqQmi7PjTaQpGdqakd3\r\n"
"0qc9i2tbH7NswXgw1nQLWCCfauSa4bim3qqIxHrlEBfRX2b2VTQcGCS/W5ocjMjn\r\n"
"n0tJ88ECgYEA8swR413F/t9QikUGwfM7n6TaxU9XIyHteBhOVZJ0+F3VlAnRw2VW\r\n"
"lMXHh2KFHFyMp9NHqrnT6ictnLtXVFIyQqGlZ+/xWa3eED9DnozSrAOj7XEszo5S\r\n"
"iJNt8zn2vkz1aBgclqPXV3AxWYuALVsMxLzCpyt0awrULOw9wzuUgukCgYEAlpMq\r\n"
"siUDhn6q02YB2Kic8565+8jDNNTEwc0i8Iq8a1XqOojDlao3NU4MLcsaAwHAiY+f\r\n"
"+08j77HF5/ITR+vxIc+Cad1UakHQMAtcPKl0+azjKXHFeM90VDlUh1kgJGgcCaZi\r\n"
"0DoZI1ezktb0BUsYLYwBHF4nQ8p3tVnEiMAWeb8CgYEA3biN/Vv9G6tDGYG/kg5V\r\n"
"PIyHW/gAUw0AltNbdbmxJ75I9E+jRxSb5HBYrcHCXQwHRpsirz3Tz9jHRoGuVkpZ\r\n"
"q4+CRVBQztyAFcYwMfHX0U3hvUvE5zwBEsfPeHZOZapR0SVztf0ZAbhq2KMUAldL\r\n"
"ab4W5CJCxh21dPCn1knqbUECgYAEju/79KLmr278d1oW9QPLXELFHI7MSqSqOUuV\r\n"
"fJ23oiI1I27IWR7SvkogGMXw0VzCzVZKhVrRJtCW9P0gcEQcgeuwyMKFdPiYe7+P\r\n"
"FpIz/MfjuU4BGkarRhEJB+mxMHWo1SCorRmVuFH3YAqDHoLc3iAqe680niyBkPYi\r\n"
"La6AgQKBgQDpFhwpYG43UQmpc5+uNhmuObWsjTol9/wrYn/4b4bxx8yKkAnV5xYJ\r\n"
"QrNsrxpj+pquSmzJNkLJYZXoGNyghac7AubpVi4pfKt077potWo0NWJ171hHo2MV\r\n"
"VNweeNktg21yIHyK0866VYMzZWWCzVPbAa8YSILjL8JVVqRfstL87A==\r\n"
"-----END RSA PRIVATE KEY-----\r\n";


