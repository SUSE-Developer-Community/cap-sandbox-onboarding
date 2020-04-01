import {cf} from './client/index.js'
import fs from 'fs'

setTimeout(()=>{
  cf.pushApp('98937aa5-5692-4f01-9e54-8b9cc8c44a2d', fs.createReadStream('./12factor.zip'), {
    name:'12Factor',
    disk_quota:256, 
    memory_quota:64,
    command: 'bundle exec ruby web.rb -p $PORT',
    buildpack: 'ruby_buildpack',
    host: `12Factor_test`
  })
}, 5000)