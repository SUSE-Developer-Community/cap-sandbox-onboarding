import got from 'got'

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
      await this.login()
    }

    const url = `${this.api_url}${path}`

    const options = JSON.parse(JSON.stringify(opts || {}))
    options.method = options.method || 'POST'
    if(!options.headers) options.headers={}
    options.headers.Authorization = this.buildAuth()
    
    return got(url, options).json()
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
