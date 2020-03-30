import {cf} from './client/index.js' //Eventually move to separate lib

const QUOTA_NAME = process.env.QUOTA_NAME


//Assuming that if org exists, user does as well. 
// If not true, will need manual intervention anyways
export const checkIfUserExists = async (email)=>{
  const org = await cf.getOrgForName(buildOrgNameFromEmail(email))
  return !!org
}

export const buildOrgNameFromEmail =(email)=>(email.replace(new RegExp("\\W",'g' ), "_"))


const generatePassword = ()=>{
  return 'Password'
}

export const buildEnvironmentForUser = async (email) => {
  const password = generatePassword()

  const user = await cf.createUser(email,password)

  const org = await cf.createOrg(buildOrgNameFromEmail(email), QUOTA_NAME)

  cf.addOrgManager(org.metadata.guid,user.metadata.guid)

  for (const space of ['dev', 'test', 'prod', 'samples']) {
    await cf.createSpaceForUser(org.metadata.guid, space, user.metadata.guid)
  }
  

  //cf.pushApp(org.metadata.guid, )



  return {
    email, 
    password,
    stratos_url: process.env.STRATOS_URL, 
    getting_started_url: process.env.GETTING_STARTED_URL
  }
}