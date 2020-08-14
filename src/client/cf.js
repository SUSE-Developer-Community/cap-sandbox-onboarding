var FormData = require('form-data')

export default class CfApiClient {
  constructor (http_client) {
    this.http_client = http_client
  }

  // http://apidocs.cloudfoundry.org/12.39.0/users/creating_a_user.html
  //This creates a CF user from an already created UAA user
  async createUser(uaa_user_id) {

    const json = {
      guid: uaa_user_id
    }
    const user = await this.http_client.makeRequest('/v2/users', {data:json})

    return user
  }
  
  async deleteUser(id){
    return await this.http_client.makeRequest(`/v2/users/${id}`, {method:'DELETE'})
  }

  async getOrgForName(orgname) {
    const org_list = await this.http_client.makeRequest('/v2/organizations?q=name:' + orgname, {method:'GET'})
    return org_list.resources[0]
  }

  async getQuotaForName(name) {
    const org_list = await this.http_client.makeRequest('/v2/quota_definitions?q=name:' + name, {method:'GET'})
    return org_list.resources[0]
  }

  async createOrg(name, quota_name) {
    const json = {name}
    try{

      const quota_definition = await this.getQuotaForName(quota_name)
      json.quota_definition_guid = quota_definition.metadata.guid
    }catch(e){
      throw `Could not find Quota GUID for ${quota_name}`
    }

    return await this.http_client.makeRequest('/v2/organizations', {method:'POST',data:json})
  }

  async deleteOrg(name) {
    const org_definition = await this.getOrgForName(name)
    const guid = org_definition.metadata.guid

    return await this.http_client.makeRequest(`/v2/organizations/${guid}?recursive=true&async=true`, {method:'DELETE'})
  }

  async addOrgManager(guid, user_guid) {
    await this.http_client.makeRequest(`/v2/organizations/${guid}/users/${user_guid}`, {method:'PUT'})
    return await this.http_client.makeRequest(`/v2/organizations/${guid}/managers/${user_guid}`, {method:'PUT'})
  }

  // http://apidocs.cloudfoundry.org/12.39.0/spaces/creating_a_space.html
  async createSpace(organization_guid, name) {

    const json = {organization_guid, name}
    return await this.http_client.makeRequest('/v2/spaces', {method:'POST',data:json})
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
    return await this.http_client.makeRequest('/v2/spaces', {method:'POST',data:json})
  }

  async findApps(count, idx) {

    const ret = await this.http_client.makeRequest('/v3/apps?per_page='+count+'&page='+idx,{method:'GET'} )

    return ret.resources
  }

  async findAppsV2(count, idx) {

    const ret = await this.http_client.makeRequest('/v3/apps?per_page='+count+'&page='+idx,{method:'GET'} )

    return ret.resources
  }

  async stopApp(guid) {
    return this.http_client.makeRequest(`/v3/apps/${guid}/actions/stop`,{method:'POST'} )
  }
  async startApp(guid) {
    return this.http_client.makeRequest(`/v3/apps/${guid}/actions/start`,{method:'POST'} )
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

    const app = await this.http_client.makeRequest('/v2/apps', {method:'POST', data: app_json})

    
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
        hostname: this.http_client.api_url.substr('8'),
        path: `/v2/apps/${app.metadata.guid}/bits`,
        headers: {'Authorization': this.http_client.buildAuth()},
        method:'put',
        protocol: 'https:'
      }, function(err, out) {
        if(err) rej(err) 
        else res(out)
      })
    })

      
    // Start App
    // 
    await this.http_client.makeRequest('/v2/apps/'+ app.metadata.guid, 
      {method:'PUT', data: {state: 'STARTED'}})


    const domains = await this.http_client.makeRequest('/v2/domains?q=name:cap.explore.suse.dev', 
      {method:'GET'})

    const route_data = {
      domain_guid: domains.resources[0].metadata.guid,
      space_guid,
      host
    }

    // Add route 
    const route = await this.http_client.makeRequest('/v2/routes', 
      {method:'POST', data: route_data})

    // Map route
    await this.http_client.makeRequest(`/v2/routes/${route.metadata.guid}/apps/${app.metadata.guid}`, 
      {method:'PUT'})

  }
  
}