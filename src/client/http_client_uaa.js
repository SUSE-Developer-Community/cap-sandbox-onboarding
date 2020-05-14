import axios from 'axios'
import qs from 'qs'

import logger from  'winston'


export default class UaaHttpClient {

  constructor(api_url, uaa_url, client_id, client_secret){
    this.api_url = api_url
    this.uaa_url = uaa_url
    this.client_id = client_id
    this.client_secret = client_secret
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
    logger.info('Logging in')
    try {

      const options = {
        url: `${this.uaa_url}/oauth/token`,
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        data: qs.stringify({
          grant_type: 'client_credentials',
          client_id: this.client_id,
          client_secret: this.client_secret
        })
      }

      const ret = await axios(options)
      this.auth = ret.data
      logger.info('UAA Logged In!')
      
    } catch(e) {
      logger.error('Error Logging in UAA', e)
    }
  }

}
