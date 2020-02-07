
// https://github.com/IBM-Cloud/cf-nodejs-client

class CloudFoundry{
  constructor(){
    this.api_auth_header = {} // etc...
  }

  buildSpaceNameFromEmail(email) {
    return email
  }

  // Assume email is sanitized here
  async addUserByEmail(email) {
    const space_name = this.buildSpaceNameFromEmail(email)

    // Add script contents here


  }

  async postToCF(action, body) {
    // Add creds and build request here
    // retry logic? Might be a nice library already
    
    try {

    } catch(e){// keep everything async/await so we can get at least a top layer of error handling
      console.err("something broke",e)
      // Do we want to notify "pager duty"?
      throw e //rethrow  to interrupt process or let continue?
    }

  }

}

export default new CloudFoundry()