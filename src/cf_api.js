import {cf} from './client/index.js' //Eventually move to separate lib
import fs from 'fs'

const QUOTA_NAME = process.env.QUOTA_NAME



//Assuming that if org exists, user does as well. 
// If not true, will need manual intervention anyways
export const checkIfUserExists = async (username)=>{
  const org = await cf.getOrgForName(buildOrgNameFromUsername(username))
  return !!org
}

export const buildOrgNameFromUsername =(username)=>(username.replace(new RegExp('\\W','g' ), '_'))

export const changeUserPassword = async (username, password)=>{
  return await cf.changePassword(username, password)
}

export const deleteUser = async (username)=>{
  return await cf.deleteUser(username)
}

export const buildEnvironmentForUser = async (username, password, email, familyName, givenName) => {

  const user = await cf.createUser(username, email, password, familyName, givenName )

  const org_name = buildOrgNameFromEmail(email)

  const org = await cf.createOrg(org_name, QUOTA_NAME)

  await cf.addOrgManager(org.metadata.guid, user.metadata.guid)

  
  await cf.createSpaceForUser(org.metadata.guid, 'dev', user.metadata.guid)
  await cf.createSpaceForUser(org.metadata.guid, 'test', user.metadata.guid)
  const samples_space = await cf.createSpaceForUser(org.metadata.guid, 'samples', user.metadata.guid)
  

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