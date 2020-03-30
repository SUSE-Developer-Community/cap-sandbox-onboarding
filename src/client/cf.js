import CfHttp from './http_client.js'

export default class CfApiClient {
  constructor (api_url, uaa_url, username, password) {
    this.CfHttp = new CfHttp(api_url, uaa_url, username, password)
  }

  async createUser(username, password) {
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

  async setOrgRole(orgname, user, rolename) {

  }

  async createSpace(org_name, space_name) {
  }

  async setSpaceRole(org_name, space_name, user, rolename) {

  }


  async pushApp(org_name, space_name, app_location) {

  }
  
}