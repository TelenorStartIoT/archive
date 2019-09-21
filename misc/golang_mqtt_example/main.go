package main

import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"io/ioutil"
	"os"
	"os/signal"
	"syscall"
	"time"

	MQTT "github.com/eclipse/paho.mqtt.golang"
)


const (
	thingName =  "" // TODO Your ThingName 
)

func onMessageReceived(client MQTT.Client, message MQTT.Message) {
	fmt.Printf("Received message on topic: %s\nMessage: %s\n", message.Topic(), message.Payload())
}

func NewTLSConfig() *tls.Config {

	// Import trusted certificates from CAfile.pem.
	// Alternatively, manually add CA certificates to
	// default openssl CA bundle.
	certpool := x509.NewCertPool()
	pemCerts, err := ioutil.ReadFile("./ca/root.pem")
	if err == nil {
		certpool.AppendCertsFromPEM(pemCerts)
	}

	// Import client certificate/key pair
	cert, err := tls.LoadX509KeyPair("./ca/cert.pem", "./ca/privkey.pem")
	if err != nil {
		panic(err)
	}

	// Just to print out the client certificate..
	cert.Leaf, err = x509.ParseCertificate(cert.Certificate[0])
	if err != nil {
		panic(err)
	}
	fmt.Println(cert.Leaf)

	// Create tls.Config with desired tls properties
	return &tls.Config{
		// RootCAs = certs used to verify server cert.
		RootCAs: certpool,
		// ClientAuth = whether to request cert from server.
		// Since the server is set up for SSL, this happens
		// anyways.
		ClientAuth: tls.RequestClientCert,
		// ClientCAs = certs used to validate client cert.
		ClientCAs: nil,
		// InsecureSkipVerify = verify that cert contents
		// match server. IP matches what is in cert etc.
		InsecureSkipVerify: true,
		// Certificates = list of certs client sends to server.
		Certificates: []tls.Certificate{cert},
	}
}

var f MQTT.MessageHandler = func(client MQTT.Client, msg MQTT.Message) {
	fmt.Printf("TOPIC: %s\n", msg.Topic())
	fmt.Printf("MSG: %s\n", msg.Payload())
}

func main() {
	ch := make(chan os.Signal, 1)
	signal.Notify(ch, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-ch
		fmt.Println("signal received, exiting")
		os.Exit(0)
	}()
	tlsconfig := NewTLSConfig()

	opts := MQTT.NewClientOptions()
	opts.AddBroker("ssl://a3k7odshaiipe8.iot.eu-west-1.amazonaws.com:8883")
	opts.SetClientID(thingName).SetTLSConfig(tlsconfig)
	opts.SetDefaultPublishHandler(f)

	// Start the connection
	c := MQTT.NewClient(opts)
	if ctoken := c.Connect(); ctoken.Wait() && ctoken.Error() != nil {
		panic(ctoken.Error())
	}

	fmt.Println("connected?:", c.IsConnected())

	topic := fmt.Sprintf("$aws/things/%s/shadow/update", thingName)


	// Set sine to 0
	if token := c.Publish(topic, 1, false, `{"state":{"reported":{"sine":0}}}`); token.Wait() && token.Error() != nil {
			panic(token.Error())
	}

	// Subscribe to update topic
	if token := c.Subscribe(topic + "/#", 0, onMessageReceived); token.Wait() && token.Error() != nil {
		panic(token.Error())
	}

	// Publish desired value -> will send msg to device with the desired value
	if token := c.Publish(topic, 1, false, `{"state":{"desired":{"sine":1}}}`); token.Wait() && token.Error() != nil {
			panic(token.Error())
	}

	time.Sleep(10 * time.Second)



	// set value to desired value to stop
	// if token := c.Publish(topic, 1, false, `{"state":{"reported":{"sine":1}}}`); token.Wait() && token.Error() != nil {
	// 		panic(token.Error())
	// }

}
