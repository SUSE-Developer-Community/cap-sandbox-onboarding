import got from 'got'
import axios from 'axios'

export default class CfHttpClient {

  constructor(api_url, uaa_url, username, password){
    this.api_url = api_url
    this.uaa_url = uaa_url
    this.password = password
    this.username = username
    this.auth = null

    this.login()
    this.passwordInterval = setInterval(this.login.bind(this), 250 * 1000)
  }


  async makeRequest(path, opts) {
    if(!this.auth) {
      throw 'Client Not Logged In (yet?)'
    }

    const url = `${this.api_url}${path}`

    const options = JSON.parse(JSON.stringify(opts || {}))
    options.method = options.method || 'post'
    if(!options.headers) options.headers={}
    options.headers.Authorization = this.buildAuth()

    options.url = url
    const ret = await axios(options)
    return ret.data
  }

  async makeUAARequest(path, opts) {
    if(!this.auth) {
      throw 'Client Not Logged In (yet?)'
    }

    const url = `${this.uaa_url}${path}`

    const options = JSON.parse(JSON.stringify(opts || {}))
    options.method = options.method || 'post'
    if(!options.headers) options.headers={}
    options.headers.Authorization = this.buildAuth()
    
    options.url = url
    const ret = await axios(options)
    return ret.data
  }

  buildAuth() {
    return `${this.auth.token_type || 'Bearer'} ${this.auth.access_token}`
  }

  async login(){
    console.log('Logging in')
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
            password: this.password
        }
    }

    this.auth = await got(url, options).json()
    console.log('Logged In!')
  }

}
