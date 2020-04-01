import {cf} from './client/index.js' //Eventually move to separate lib
import https from 'https'
import fs from 'fs'

const QUOTA_NAME = process.env.QUOTA_NAME



//Assuming that if org exists, user does as well. 
// If not true, will need manual intervention anyways
export const checkIfUserExists = async (email)=>{
  const org = await cf.getOrgForName(buildOrgNameFromEmail(email))
  return !!org
}

export const buildOrgNameFromEmail =(email)=>(email.replace(new RegExp("\\W",'g' ), "_"))


const generatePassword = ()=>{
  const all = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz23456789';
  let password = '';

  for (var index = 0; index < 12; index++) {
      var character = Math.floor(Math.random() * all.length);
      password += all.substring(character, character + 1);
  }

  return password;
}

export const buildEnvironmentForUser = async (email) => {
  const password = generatePassword()

  const user = await cf.createUser(email,password)

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
    buildpack: 'ruby_buildpack',
    host: `12Factor_${org_name}`
  })

  return {
    email, 
    password,
    stratos_url: process.env.STRATOS_URL, 
    getting_started_url: process.env.GETTING_STARTED_URL
  }
}

export const loadSampleApp = ()=>{
  return new Promise((resolve, reject)=>{
    var file = fs.createWriteStream('./12factor.zip')

    https.get('https://codeload.github.com/scf-samples/12factor/zip/scf', function(res) {
      res.on('data', function(data) {
        file.write(data)
      }).on('end', function() {
        file.end()
        resolve()
      }).on('error',reject)
    });
  })
}