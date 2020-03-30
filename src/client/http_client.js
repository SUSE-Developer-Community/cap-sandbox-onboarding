import got from 'got'

const {
  performance
} = require('perf_hooks');

export default class CfHttpClient {

  constructor(api_url, uaa_url, username, password){
    this.api_url = api_url
    this.uaa_url = uaa_url
    this.password = password
    this.username = username
    this.auth = null
  }


  async makeRequest(path, opts) {
    if(!this.auth) {
      console.log('Logging in')
      await this.login()
      console.log('Logged in')
    }

    const url = `${this.api_url}${path}`

    const options = JSON.parse(JSON.stringify(opts || {}))
    options.method = options.method || 'POST'
    if(!options.headers) options.headers={}
    options.headers.Authorization = this.buildAuth()

    console.log('Sending Req')
    const ret = await got(url, options).json() //Need to add retry logic for login. Or add login refresh timer
    console.log('Got Res')
    return ret


  }

  buildAuth() {
    return `${this.auth.token_type || 'Bearer'} ${this.auth.access_token}`
  }

  async login(){
    const url = `${this.uaa_url}/oauth/token`;
    const options = {
        method: "POST",
        headers: {
            Authorization: "Basic Y2Y6",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        form: {
            grant_type: "password",
            client_id: "cf",
            username: this.username,
            password:this.password
        }
    }

    this.auth = await got(url, options).json()
  }

}
