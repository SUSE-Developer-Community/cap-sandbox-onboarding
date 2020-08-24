export default class UaaApiClient {
  constructor (http_client) {
    this.http_client = http_client
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
  
    return await this.http_client.makeRequest('/Users', {data:uaa_json, headers:{'Content-Type':'application/json'}})
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

    const ret = await this.http_client.makeRequest('/Users?count=1000&filter='
    + encodeURIComponent(filterQ),{method:'GET'} )

    return ret.resources
  }
  
  async changePassword(id, password) {
    const data = {
      password
    }

    return await this.http_client.makeRequest(`/Users/${id}/password`, {method:'PUT', data, headers:{'Content-Type':'application/json'}})
  }
  
  async deleteUser(id){
    return await this.http_client.makeRequest(`/Users/${id}`, {method:'DELETE'})
  }
}