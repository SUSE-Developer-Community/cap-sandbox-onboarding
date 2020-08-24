import {uaa} from './client/index.js'

setTimeout(()=>{
  console.log('Starting pull')
  uaa.findUsers([]).then((users)=>{
    console.log(users[2])
  })

},5000)