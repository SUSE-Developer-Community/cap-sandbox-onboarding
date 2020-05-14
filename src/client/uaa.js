export default class UaaApiClient {
  constructor (http_client) {
    this.CfHttp = http_client
  }

  // Why does there have to be a random call that's different :(

  // http://docs.cloudfoundry.org/api/uaa/version/4.24.0/index.html#create-4
  // http://apidocs.cloudfoundry.org/12.39.0/users/creating_a_user.html
  async createUser(userName, email, password, familyName, givenName) {

    const uaa_json = {
      userName,
      password: password,
      name: {
        familyName,
        givenName
      },
      emails: [{
        value: email,
        primary: true
      }],
      verified: true
    }
  
    const uaa_user = await this.CfHttp.makeUAARequest('/Users', {data:uaa_json, headers:{'Content-Type':'application/json'}})

    const json = {
      guid: uaa_user.id
    }
    const user = await this.CfHttp.makeRequest('/v2/users', {data:json})

    return user
  }

  async getUserForUsername(username) {
    const users = await this.findUsers([{key:'Username',value: username}])
    return users[0]
  }

  async findUsers(filters) {

    const filterQ = filters.map((curr) => (
      ''.concat(curr.key, ' ' , curr.comparison||'eq' ,
        ' ' ,
        '"' ,
        curr.value ,
        '"')
    )).join(' and ')

    const ret = await this.CfHttp.makeUAARequest('/Users?filter='
    + encodeURIComponent(filterQ),{method:'GET'} )

    return ret.resources
  }
  
  async changePassword(id, password) {
    const data = {
      password
    }

    return await this.CfHttp.makeUAARequest(`/Users/${id}`, {data, headers:{'Content-Type':'application/json'}})
  }
  
  async deleteUser(id){
    return await this.CfHttp.makeUAARequest(`/Users/${id}`, {method:'DELETE'})
  }
}