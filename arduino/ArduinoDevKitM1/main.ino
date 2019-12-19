#include <MKRNB.h>

const char PINNUMBER[]    = "1111";   // PIN Number
const char APN[]          = "mda.ee"; // APN
unsigned int MIC_UDP_PORT = 1234;     // Local port to listen for UDP packets
IPAddress MIC_IP(172, 16, 15, 14);    // No need to change this for Start IoT
NB nbAccess(true);                    // true enables modem debug (i.e. print AT commands on serial)
GPRS gprs;
NBUDP Udp;
byte packetBuffer[512];

void setup() {
  String response;

  // Reset the ublox module
  pinMode(SARA_RESETN, OUTPUT);
  digitalWrite(SARA_RESETN, HIGH);
  delay(100);
  digitalWrite(SARA_RESETN, LOW);
  
  // Open serial communications and wait for port to open
  Serial.begin(115200);
  while (!Serial);

  // Wait for modem to become ready
  Serial.println("Waiting for modem to get ready...");
  MODEM.begin();
  while (!MODEM.noop());

  // Disconnect from any networks
  Serial.print("Disconnecting from network: ");
  MODEM.sendf("AT+COPS=2");
  MODEM.waitForResponse(2000);
  Serial.println("done.");

  // Set Radio Access Technology (RAT)
  Serial.println("Set Radio Access Technology to NB-IoT or Cat M1 (7 is for Cat M1 and 8 is for NB-IoT): ");
  MODEM.sendf("AT+URAT=7");
  MODEM.waitForResponse(100, &response);
  Serial.println("done.");

  // Apply changes
  Serial.print("Applying changes and saving configuration: ");
  MODEM.sendf("AT+CFUN=15");
  MODEM.waitForResponse(5000);
  delay(5000);

  while (MODEM.waitForResponse(1000) != 1) {
    delay(1000);
    MODEM.noop();
  }
  Serial.println("done.");

  // Set modem to "full functionality"
  Serial.println("Modem ready, turn radio on in order to configure it...");
  MODEM.sendf("AT+CFUN=1");
  MODEM.waitForResponse(2000, &response);
  Serial.println("done.");

  // Wait for a good signal strength (between 0 and 98)
  Serial.println("Check attachment until CSQ RSSI indicator is less than 99...");
  int status = 99;
  while (status > 98 && status > 0) {
    MODEM.sendf("AT+CSQ");
    MODEM.waitForResponse(2000, &response);

    String sub = response.substring(6,8);
    status = sub.toInt(); // Will return 0 if no valid number is found
    delay(1000);
  }
  Serial.println("done.");

  // Set operator to Telenor
  Serial.println("Set operator to Telenor...");
  MODEM.sendf("AT+COPS=1,2,\"24201\"");
  MODEM.waitForResponse(2000, &response);
  Serial.println("done.");

  // Set APN and check if network is ready
  boolean connected = false;
  while (!connected) {
    if ((nbAccess.begin(PINNUMBER, APN) == NB_READY) && (gprs.attachGPRS() == GPRS_READY)) {
      connected = true;
    } else {
      Serial.println("Not connected");
      delay(1000);
    }
  }

  Serial.println("Setup socket for connection to MIC...");
  Udp.begin(MIC_UDP_PORT);

  // Seed random number generator with noise from pin 0
  randomSeed(analogRead(0));
}

void loop() {
  Serial.print("Send packet to MIC...");
  sendMICUDPpacket(MIC_IP);

  Serial.println("Check if we have received something...");
  if (receiveMICUDPpacket() > 0) {
    Serial.println("Received packet...");
    String bufferString = String((char *) packetBuffer);
    Serial.println("Packet data is: <" + bufferString + ">");
  } else {
    Serial.println("No data received...");
  }

  // Wait 30 seconds before sending again
  Serial.println("Wait 30s before sending again...");
  delay(30000);
}

// Read a packet from the UDP port
int receiveMICUDPpacket() {
  int size = Udp.parsePacket();

  // Check if size is larger than 0, if yes we have received something
  if (size > 0) {
    Serial.println("Packet received!");
    Udp.read(packetBuffer, size); // read the packet into the buffer

    return size;
  }

  return 0;
}

// Send a JSON formatted packed to MIC
unsigned long sendMICUDPpacket(IPAddress& address) {
  String p1, p2, p4, payload = "";
  float hum, tmp, r = 0.0;

  hum = 60;
  r = random(0, 9);
  r = r / 10;
  hum = hum + r;
  p1 = hum;
  tmp = 20;
  r = random(0, 9);
  r = r / 10;
  tmp = tmp + r;
  p2 = tmp;

  payload = "{\"temperature\":\"" + p2 + "\", \"humidity\":\"" + p1 + "\",\"latlng\": \"69.681812, 18.988209\"}";
  Serial.println("payload is: " + payload);
  Udp.beginPacket(address, MIC_UDP_PORT);
  Udp.write(payload.c_str(), payload.length());
  Udp.endPacket();
}
