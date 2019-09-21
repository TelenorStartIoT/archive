# MQTT client with Cloud Connect cognito authentication

Demonstration on how to use the `cloud-connect` Node.js module to authenticate with Cognito identity.

## Install local cloud-connect NPM module

```
$ cd cloud-connect
/cloud-connect$ npm link && cd ..
$ npm link cloud-connect
$ npm install
```

### Run cloud-connect with Cognito identity

```
$ node lib/cognito.js -u <CC username> -P <CC password> -v -a 064445364562 -e prod -s '<sub topic>' -p '<pub topic>'
```

#### MQTT topic format

`pub/<root domain>/<sub domain>/<thing name>`

`sub/<root domain>/<sub domain>/<thing name>`


E.g.

`sub/UIT IFI course/pau001/00000273`

**N.B.** Replace dash `-` with whitespace.
