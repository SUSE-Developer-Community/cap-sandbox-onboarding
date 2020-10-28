import {uaa} from './client/index.js'

// to run this, use `cf ssh onboarding-js -c 'cd app; ./node dist/pull_user_list.js'` as an admin with the right permissions

setTimeout(()=>{
  console.error('Starting pull')
  uaa.findUsers([]).then(lis=>{
    lis.filter((u=>(u.emails.length>0))).map((u)=>(u.emails[0].value)).forEach(email => {
      console.log(email)
    })
  })

},5000)