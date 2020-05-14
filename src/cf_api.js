import {cf, uaa} from './client/index.js' //Eventually move to separate lib
import fs from 'fs'

const QUOTA_NAME = process.env.QUOTA_NAME


export const checkIfUserExists = async (username)=>{
  try{
    cf.getUserForUsername(username)
    return false
  }catch(e){
    return true
  }
}

export const createUser = async (username, email, password, familyName, givenName) => {
  const uaa_user = await uaa.createUser(username, email, password, familyName, givenName)
  
  return await cf.createUser(uaa_user.id)
}

export const changeUserPassword = async (email, username, password)=>{
  const users = await uaa.findUsers([{key:'Email',value:email}, {key: 'Username',value: username}])
  
  if(users.length==1){
    await uaa.changePassword(users[0].id, password)
  } else { throw new Error('not_found') }
}

export const deleteUser = async (email, username) => {
  const users = await uaa.findUsers([{key:'Email',value:email}, {key: 'Username',value: username}])
  
  if(users.length==1){
    await uaa.deleteUser(users[0].id) //TODO: CF Org as well?
  } else { throw new Error('not_found') }
}

export const listUsersWithEmail = async (email)=> {
  const users = await uaa.findUsers([{key:'Email',value:email}])
  return users.map((u)=>({
    userName: u.userName, 
    lastLogonTime: u.lastLogonTime, 
    passwordLastModified: u.passwordLastModified,
    created: u.created,
    active: u.active
  }))
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