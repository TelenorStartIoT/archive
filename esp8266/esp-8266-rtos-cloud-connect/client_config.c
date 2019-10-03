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
"MIIDWTCCAkGgAwIBAgIUHOYPMtdqf7H3tbIy0kLKxBlwPPswDQYJKoZIhvcNAQEL\r\n"
"BQAwTTFLMEkGA1UECwxCQW1hem9uIFdlYiBTZXJ2aWNlcyBPPUFtYXpvbi5jb20g\r\n"
"SW5jLiBMPVNlYXR0bGUgU1Q9V2FzaGluZ3RvbiBDPVVTMB4XDTE3MDEwNzE0MDEz\r\n"
"OFoXDTQ5MTIzMTIzNTk1OVowHjEcMBoGA1UEAwwTQVdTIElvVCBDZXJ0aWZpY2F0\r\n"
"ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKuMFInC5IsQl5r2TWaB\r\n"
"PDSeZ6cX7O7RdzlzkgVxrQ4u7iGea3Z9BL5jX9yNkcip5KFCzDiNK9McKpi65eCv\r\n"
"QA7Oj9+X9qO2cKak+5gCr5b13ZvD4Cbo+1UtNIp9PtXxGTOapHrJgh3tMbvIUbfx\r\n"
"cNm3mZ33pGQnbrpmBC7ZozMEYpfjRj9cC+sIHDyHuoeSK/9vDVqK5uDQuXCkbJ7I\r\n"
"MTgcOyda9XwYPG2YU0MujwqD0Os9MK1c9sUKo/AiKXWi2eB0yC4OIZIuTfAURfFs\r\n"
"xmiaNuyIz4eTW95mTn2q5d5dLlRl7H5yPL1bRgPo0QoGwSh0JBRnpy8hwt1Aciwd\r\n"
"zNkCAwEAAaNgMF4wHwYDVR0jBBgwFoAUOuwt44bac7CEF8bhjw5hnHfye8kwHQYD\r\n"
"VR0OBBYEFA/I/HUM6wi6/E0WKt/+T/Im1cG5MAwGA1UdEwEB/wQCMAAwDgYDVR0P\r\n"
"AQH/BAQDAgeAMA0GCSqGSIb3DQEBCwUAA4IBAQAmFr8oFXPENvF2s0JGJFKgopc1\r\n"
"7irQqV1tN1TrSFL2cE2gyM3QogVgOkAtHElE0wy5G1ocGrOBoxa3/4RH9G08/RuQ\r\n"
"4sCWnrIpFFZTzkZIXPRR3hKNYvM9UEqHIewRW554D4wb9n6FYKGaChTXS5j0lEEJ\r\n"
"nRNJUJOSdDT/E6Pf+C3bf1M048iwTeOwi6Niec6i0snywg6UBdtO+oUJvpgM4Or7\r\n"
"oP/MpAlhPQq8fJP2FhvCxJcakV7iqQaXt/xeHamjz84wk+Sa45VN7ftD5qHCLTwH\r\n"
"QONzGn+DIJ217E3EPheDmqXazBG+5rs9M5CDl9/7Wn5odMkSNK0J1s1n62EX\r\n"
"-----END CERTIFICATE-----\r\n";


// AWS IoT device private key (RSA)
const char *client_key = 
"-----BEGIN RSA PRIVATE KEY-----\r\n"
"MIIEowIBAAKCAQEAq4wUicLkixCXmvZNZoE8NJ5npxfs7tF3OXOSBXGtDi7uIZ5r\r\n"
"dn0EvmNf3I2RyKnkoULMOI0r0xwqmLrl4K9ADs6P35f2o7ZwpqT7mAKvlvXdm8Pg\r\n"
"Juj7VS00in0+1fEZM5qkesmCHe0xu8hRt/Fw2beZnfekZCduumYELtmjMwRil+NG\r\n"
"P1wL6wgcPIe6h5Ir/28NWorm4NC5cKRsnsgxOBw7J1r1fBg8bZhTQy6PCoPQ6z0w\r\n"
"rVz2xQqj8CIpdaLZ4HTILg4hki5N8BRF8WzGaJo27IjPh5Nb3mZOfarl3l0uVGXs\r\n"
"fnI8vVtGA+jRCgbBKHQkFGenLyHC3UByLB3M2QIDAQABAoIBAA8VF9Es428enFWx\r\n"
"hgiXIDX4H2Dfh6NPo03XzWTRI8f1dFZcWVJnl30tu4XmpISh+0n6V345WzsKZOxc\r\n"
"sk1Y2ybyHlAoSjUGm0zrgHtS8SEyqLNDO3fwT/ijKtVqQZYJxo907zUkdl4vNoou\r\n"
"CJFFlwhtTgJHfZqYpPGaeo+r7t9TRH3Y9+B8gOC/I5EHXXmgJM2hETmJuF+02Bzp\r\n"
"nFJQ9I44lodnoFd/n1G76k1DHKB17tS7v1I6GsUsv0d7GcCPzpxPzJDPlyTCiMlW\r\n"
"SNzq5Tr6FCmmLBdRuGRc9LdBnSRx2dF02lJZn2Vjtr0S/0MK4EdJ8vrnm/9s5RJb\r\n"
"Lzx5k6ECgYEA2p/zqjX+Dff4He+MHsh+LAHJMj5H5MV5NKxxxuaMIzyC3ueiE3yH\r\n"
"3DIhdTN9s3JPl9YdWJuRQaCcjxdosbCUOwesOT4V+y1VKOsBJX6q1ulR0mdYJgpS\r\n"
"7sJGBLJ50J/b+uatsBFE1TZrZYWqYfdeOF5d6xZYe0ueGE7Y6tw8EF0CgYEAyN/K\r\n"
"Y+cNEhCQBhzeh4gXiQUeIbnD2zZjsz/9RxbPyWvGpQYiopewxdNbUeE+gJ93Kh/w\r\n"
"evKLEED5kYEX9UCW4Gs0CZ+LvsUYhUJAFHzl6p2dM5JTgYaXE1wLRRMm73oVlQaG\r\n"
"kwJ2Gf930vOjGFh+n55byVlKT5BNtRMlnS+t1q0CgYBBv0qrDJO7pbATaJ/t/gOb\r\n"
"vmnAV2SNkymRQq7wzxKj4iXFXUmrrI67FMRlF7gcyCrRkc2/gQFdCC0tBzAwB9d8\r\n"
"LSGJEXfQ0uBCbvIoUYCVIxO9P+ENh5tLPFeMQBRMPlcMjGT9hyP5LuV7YYhM7/SA\r\n"
"5Tg/Y7f2VFZWHxgzAUp67QKBgHhoTPUdZmRRsUM4wtsS5KipfKpSo+ge7hxgWv3l\r\n"
"2p+uDuCUkOZNbxTl4HNwRPrsm42Qn6HTCTCxAegKLcZA9S+IkyTBkg7ELjKSx76A\r\n"
"L4E3ASgMqimV97EPF2JMXKZn09AEnV45t3lV/QliKX1KbnxXfEVxVG3k3e+Qjpdu\r\n"
"IRHxAoGBANki6ng8L38F2NVgDOU+0rGSB/DqK95Rnik5+sf4EX3sUwK1p8GJTGtY\r\n"
"8eItAIXZqV/iy0UWK4VMmqmUwQxgYcvP0LQgCbTJYBTeqeDboemmuYK73/usU//k\r\n"
"j39CTGOxshOsWZ5ifiu+IA2FaCFxHGMJjFnFmEZoB6TLSoiipzjn\r\n"
"-----END RSA PRIVATE KEY-----\r\n";

