import {cf, uaa} from './client/index.js' //Eventually move to separate lib
import fs from 'fs'

import opentelemetry from '@opentelemetry/api'
const tracer = opentelemetry.trace.getTracer('basic')

const QUOTA_NAME = process.env.QUOTA_NAME


//Checks if a user exists for given username
export const checkIfUserExists = async (username)=>{
  try{
    uaa.getUserForUsername(username)
    return false
  }catch(e){
    return true
  }
}

// Creates a user in uaa and then in cf
export const createUser = async (username, email, password, familyName, givenName) => {
  const uaa_user = await uaa.createUser(username, email, password, familyName, givenName)

  //TODO: More graceful failure/rollback is UAA creates but CF doesn't
  
  return await cf.createUser(uaa_user.id)
}


// Changes the password of a user. Uses the email as well for a sanity check.
export const changeUserPassword = async (email, username, password)=>{
  const users = await uaa.findUsers([{key:'Email',value:email}, {key: 'Username',value: username}])
  
  if(users.length==1){
    try{
      await uaa.changePassword(users[0].id, password)
    } catch (e){
      console.error(e)
    }
  } else { throw new Error('not_found') }
}

// Omit org_name to only delete uaa user and delete org
export const deleteUser = async (email, username, org_name = false) => {
  const users = await uaa.findUsers([{key:'Email',value:email}, {key: 'Username',value: username}])
  
  if(users.length==1){
    await uaa.deleteUser(users[0].id)
    await cf.deleteUser(users[0].id) 
    if(org_name) { 
      await cf.deleteOrg(org_name) 
    }

  } else { throw new Error('not_found') }
}

export const listUsersWithEmail = async (email)=> {
  const span = tracer.startSpan('listUsersWithEmail')
  const users = await uaa.findUsers([{key:'Email',value:email}])
  
  const ret = users.map((u)=>({
    userName: u.userName, 
    lastLogonTime: u.lastLogonTime, 
    passwordLastModified: u.passwordLastModified,
    created: u.created,
    active: u.active
  }))
  span.end()

  return ret
}

export const listAllUsers = async ()=>{
  const users = await uaa.findUsers([])
  const ret = users.map((u)=>({
    userName: u.userName,
    email: u.emails[0].value,
    lastLogonTime: u.lastLogonTime, 
    passwordLastModified: u.passwordLastModified,
    created: u.created,
    active: u.active
  }))

  return ret
}

export const buildEnvironmentForUser = async (user_id, org_name) => {

  const org = await cf.createOrg(org_name, QUOTA_NAME)

  await cf.addOrgManager(org.metadata.guid, user_id)

  
  await cf.createSpaceForUser(org.metadata.guid, 'dev', user_id)
  await cf.createSpaceForUser(org.metadata.guid, 'test', user_id)
  const samples_space = await cf.createSpaceForUser(org.metadata.guid, 'samples', user_id)
  

  cf.pushApp(samples_space.metadata.guid, fs.createReadStream('./12factor.zip'), {
    name:'12Factor',
    disk_quota:256, 
    memory_quota:64,
    command: 'bundle exec ruby web.rb -p $PORT',
    buildpack: 'ruby_buildpack',
    host: `12Factor_${org_name}`
  })
}

// export const loadSampleApp = ()=>{
//   return new Promise((resolve, reject)=>{
//     var file = fs.createWriteStream('./12factor.zip')

//     https.get('https://codeload.github.com/scf-samples/12factor/zip/scf', function(res) {
//       res.on('data', function(data) {
//         file.write(data)
//       }).on('end', function() {
//         file.end()
//         resolve()
//       }).on('error',reject)
//     });
//   })
// }