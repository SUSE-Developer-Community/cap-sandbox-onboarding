import CfHttp from './http_client.js'

var FormData = require('form-data')

export default class CfApiClient {
  constructor (api_url, uaa_url, username, password) {
    this.CfHttp = new CfHttp(api_url, uaa_url, username, password)
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
    const quota_definition_guid = quota_definition.metadata.guid

    const json = {name, quota_definition_guid}

    return await this.CfHttp.makeRequest('/v2/organizations', {method:'POST',data:json})
  }

  async addOrgManager(guid, user_guid) {
    await this.CfHttp.makeRequest(`/v2/organizations/${guid}/users/${user_guid}`, {method:'PUT'})
    return await this.CfHttp.makeRequest(`/v2/organizations/${guid}/managers/${user_guid}`, {method:'PUT'})
  }

  // http://apidocs.cloudfoundry.org/12.39.0/spaces/creating_a_space.html
  async createSpace(organization_guid, name) {

    const json = {organization_guid, name}
    return await this.CfHttp.makeRequest('/v2/spaces', {method:'POST',data:json})
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
    return await this.CfHttp.makeRequest('/v2/spaces', {method:'POST',data:json})
  }

  async pushApp(space_guid, app_fs, {name, command, memory_quota, disk_quota, buildpack, host }) {

    // Create App object
    // http://apidocs.cloudfoundry.org/12.39.0/apps/creating_an_app.html
    const app_json = {
      space_guid, 
      name, 
      instances: 1,
      diego: true,
      state: 'STOPPED',
      command,
      disk_quota,
      memory: memory_quota,
      buildpack,
      health_check_http_endpoint:'/',
      environment_json:{}
    }

    const app = await this.CfHttp.makeRequest('/v2/apps', {method:'POST', data: app_json})

    
    // Upload bits
    // http://apidocs.cloudfoundry.org/12.39.0/apps/uploads_the_bits_for_an_app.html
    const form = new FormData()
    form.append('async','false')
    form.append('resources', '[]')
    form.append('application', app_fs, {
      filename:'application.zip', 
      contentType:'application/zip'
    })

    // This is weird and annoying but works. Can't figure out how to get axios to send the right data...
    await new Promise((res,rej)=>{
      form.submit({
        hostname: this.CfHttp.api_url.substr('8'),
        path: `/v2/apps/${app.metadata.guid}/bits`,
        headers: {'Authorization': this.CfHttp.buildAuth()},
        method:'put',
        protocol: 'https:'
      }, function(err, out) {
        if(err) rej(err) 
        else res(out)
      })
    })

      
    // Start App
    // 
    await this.CfHttp.makeRequest('/v2/apps/'+ app.metadata.guid, 
      {method:'PUT', data: {state: 'STARTED'}})


    const domains = await this.CfHttp.makeRequest('/v2/domains?q=name:cap.explore.suse.dev', 
      {method:'GET'})

    const route_data = {
      domain_guid: domains.resources[0].metadata.guid,
      space_guid,
      host
    }

    // Add route 
    const route = await this.CfHttp.makeRequest('/v2/routes', 
      {method:'POST', data: route_data})

    // Map route
    await this.CfHttp.makeRequest(`/v2/routes/${route.metadata.guid}/apps/${app.metadata.guid}`, 
      {method:'PUT'})

  }
  
}