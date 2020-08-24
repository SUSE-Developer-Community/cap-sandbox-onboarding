import axios from 'axios'

import logger from  'winston'


export default class CfHttpClient {

  constructor(name, api_url, loginOptions){
    this.name = name
    this.api_url = api_url
    this.loginOptions = loginOptions 


    this.auth = null

    this.login()
    this.passwordInterval = setInterval(this.login.bind(this), 250 * 1000)
  }


  async makeRequest(path, opts) {
    if(!this.auth) {
      throw `${this.name} Client Not Logged In (yet?)`
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

  buildAuth() {
    return `${this.auth.token_type || 'Bearer'} ${this.auth.access_token}`
  }

  async login(){
    logger.info(`Logging ${this.name} in`)
    try {

      const options = this.loginOptions

      const ret = await axios(options)
      this.auth = ret.data
      logger.info(`${this.name} Logged In!`)
      
    } catch(e) {
      logger.error(`Error Logging in ${this.name}`, e)
    }
  }

}
