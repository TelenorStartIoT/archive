import AWS from 'aws-sdk'

class ManagedIotCloud {
  /* Init class with host name configured for Start IoT.
   */
  constructor () {
    this.host = null
    this.AWS = AWS
    this.manifest = null
    this.account = null
  }

  /* Load AWS manifest */
  async init (host) {
    this.host = host

    if (this.manifest !== null) {
      return
    }

    try {
      await this.loadManifest()
    } catch (e) {
      throw `Could not initialize MIC: ${e}`
    }
  }

  /* Parse different formats returned by a Lambda call */
  parseError (error) {
    if (error && error.errorMessage) {
      return JSON.parse(error.errorMessage).message
    } else if (typeof error === 'string') {
      return JSON.parse(error)
    } else {
      return error
    }
  }

  /* Determine if an error returned by a Lambda call is an auth error */
  isAuthError (error) {
    const authErrors = /No data|Token is expired|Invalid login token|Missing credentials in config|is not authorized to perform|Not Found/
    return (typeof error === 'string' && error.match(authErrors)) ||
           (typeof error.message === 'string' && error.message.match(authErrors))
  }

  /* Fetch manifest from correct URL */
  async loadManifest () {
    const manifestUrl = `https://1u31fuekv5.execute-api.eu-west-1.amazonaws.com/prod/manifest/?hostname=${this.host}`

    try {
      const response = await fetch(manifestUrl)
      const manifest = await response.json()
      this.manifest = manifest
      this.AWS.config.region = manifest.Region
    } catch (e) {
      throw e
    }
  }

  /* Invoke will execute a AWS Lambda function */
  async invoke (functionName, payload) {
    /* Create an instance of the Lambda call for
     * potentially later usage.
     */
    const invokeInstance = () => {
      return this.lambda(functionName, payload)
    }

    /* Run it, but catch errors */
    try {
      return await invokeInstance()
    } catch (e) {
      /* Refresh token if auth error */
      if (this.isAuthError(e)) {
        try {
          await this.refresh(this.account.credentials.refreshToken)
          return await invokeInstance()
        } catch (e) {
          // Should logout here
          window.location.href = '/logout'
          throw e
        }
      } else {
        throw e
      }
    }
  }

  /* Execute a MIC Cloud API call */
  lambda (functionName, payload) {
    return new Promise((resolve, reject) => {
      /* Lambda parameters */
      let params = {
        FunctionName: this.manifest[functionName],
        Payload: JSON.stringify(payload)
      }

      /* Invoke the Lambda function */
      let lambda = new this.AWS.Lambda()
      lambda.invoke(params, (err, res) => {
        /* Parse response */
        try {
          /* Got error */
          if (err) reject(this.parseError(err))
          /* Empty response */
          if (!res || !res.Payload) {
            reject(new Error('No data'))
          }
          /* No error, got a response */
          const payload = JSON.parse(res.Payload)
          /* Got an error message in response */
          if (res.FunctionError || payload.errorMessage) {
            reject(this.parseError(payload))
          }
          /* OK */
          resolve(payload)
        /* Unexpected error */
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  /* Get AWS Cognito Credentials */
  async getCredentials (token = null) {
    try {
      this.AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: this.manifest.IdentityPool,
        Logins: {
          [`cognito-idp.${this.manifest.Region}.amazonaws.com/${this.manifest.UserPool}`]: token
        }
      })

      /* Clear previously cached ID if token is absent */
      if (token === null) {
        this.AWS.config.credentials.clearCachedId()
      }

      await this.AWS.config.credentials.getPromise()
    } catch (e) {
      throw e
    }
  }

  async refresh (refreshToken) {
    try {
      // Reset potential previous session
      await this.getCredentials()

      /* Invoke an AuthLambda call to obtain an
       * authentication token from MIC.
       */
      const payload = {
        action: 'REFRESH',
        attributes: {
          refreshToken
        }
      }
      this.account = await this.invoke('AuthLambda', payload)

      /* Get AWS Cognito raised privilege credential
       * using the obtained MIC auth token.
       */
      await this.getCredentials(this.account.credentials.token)
      return this.account
    } catch (e) {
      throw e
    }
  }

  /* Perform steps needed to create a Cognito Identity */
  async login (username, password) {
    try {
      await this.init()
      await this.getCredentials()

      /* Invoke an AuthLambda call to obtain an
       * authentication token from MIC.
       */
      const payload = {
        action: 'LOGIN',
        attributes: {
          userName: username,
          password: password
        }
      }
      this.account = await this.invoke('AuthLambda', payload)

      /* Get AWS Cognito raised privilege credential
       * using the obtained MIC auth token.
       */
      await this.getCredentials(this.account.credentials.token)
      return this.account
    } catch (e) {
      throw e
    }
  }
}

export let MIC = new ManagedIotCloud()
