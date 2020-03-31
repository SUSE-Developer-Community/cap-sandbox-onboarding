import CfHttp from './http_client.js'

export default class CfApiClient {
  constructor (api_url, uaa_url, username, password) {
    this.CfHttp = new CfHttp(api_url, uaa_url, username, password)
  }

  // Why does there have to be a random call that's different :(

  // http://docs.cloudfoundry.org/api/uaa/version/4.24.0/index.html#create-4
  // http://apidocs.cloudfoundry.org/12.39.0/users/creating_a_user.html
  async createUser(email, password) {

    const uaa_json = {
      userName: email,
      password: password,
      name: {
        familyName:email,
        givenName:email
      },
      emails: [{
        value: email,
        primary: true
      }],
      verified: true
    }
  
    const uaa_user = await this.CfHttp.makeUAARequest('/Users', {json:uaa_json, headers:{'Content-Type':'application/json'}})

    const json = {
      guid: uaa_user.id
    }
    const user = await this.CfHttp.makeRequest('/v2/users', {json})

    return user
  }

  async getOrgForName(orgname) {
    const org_list = await this.CfHttp.makeRequest('/v2/organizations?q=name:' + orgname, {method:'GET'})
    return org_list.resources[0]
  }

  async getQuotaForName(name) {
    const org_list = await this.CfHttp.makeRequest('/v2/quota_definitions?q=name:' + name, {method:'GET'})
    return org_list.resources[0]
  }

  async createOrg(name, quota) {
    const quota_definition = await this.getQuotaForName(quota)

    console.log(quota_definition)
    const quota_definition_guid = quota_definition.metadata.guid

    const json = {name, quota_definition_guid}

    return await this.CfHttp.makeRequest('/v2/organizations', {method:'POST',json})
  }

  async addOrgManager(guid, user_guid) {
    return await this.CfHttp.makeRequest(`/v2/organizations/${guid}/users/${user_guid}`, {method:'PUT'})
  }

  // http://apidocs.cloudfoundry.org/12.39.0/spaces/creating_a_space.html
  async createSpace(organization_guid, name) {

    const json = {organization_guid, name}
    return await this.CfHttp.makeRequest('/v2/spaces', {method:'POST',json})
  }

  // http://apidocs.cloudfoundry.org/12.39.0/spaces/creating_a_space.html
  async createSpaceForUser(organization_guid, name, user_guid) {

    const json = {
      organization_guid, 
      name, 
      developer_guids: [user_guid],
      manager_guids: [user_guid],
      auditor_guids: [user_guid]
    }
    return await this.CfHttp.makeRequest('/v2/spaces', {method:'POST',json})
  }

  async setSpaceRole(org_name, space_name, user, rolename) {

  }


  async pushApp(org_name, space_name, app_location) {

  }
  
}