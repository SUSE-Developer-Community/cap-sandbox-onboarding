import {cf} from './client/index.js'

setTimeout(()=>{
  cf.changePassword('randomuser','SomeRandomPassword!123').catch((err)=>{console.error(err)})
}, 5000)