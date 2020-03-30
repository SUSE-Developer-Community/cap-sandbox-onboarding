import {cf} from './client/index.js'

cf.createOrg('test-org2','sandbox').then((out)=>{
  console.log(out)
}).catch((err)=>{console.error(err)})