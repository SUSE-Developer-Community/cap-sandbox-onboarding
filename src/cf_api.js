import {cf} from './client/index.js' //Eventually move to separate lib


export const checkIfUserExists = async (email)=>{
  return await cf.doesUserOrgExist(buildOrgFromEmail(email))
}

export const buildOrgFromEmail =(email)=>(email.replaceAll("\\W", "_"))


export const buildEnvironmentForUser = (email) => {



}