import express from 'express'

import {checkIfUserExists, buildEnvironmentForUser, resetUserPassword, deleteUser} from './cf_api.js'
import {sendWelcomeEmail} from './email.js'
import {verifySignature} from './crypto.js'

import winston from  'winston'

winston.level = process.env.LOG_LEVEL || 'debug'
winston.add(new winston.transports.Console({
  format: winston.format.simple(),
  handleExceptions: true
}))


const app = express()
app.use(express.urlencoded({extended:true}))

app.use((req, res, next)=>{
  if(verifySignature(req.body.email, req.body.emailSignature)) {
    next()
  } else {
    res.send(401).send(JSON.stringify({status:401, message:'Email and signature did not match'}))
  }
})

app.post('/test', (req, res)=>{
  res.send(req.body) 
})

app.post('/addUser', async (req, res) => {

  const {email, firstName, lastName, userName, password} = req.body

  try{
    const exists = await checkIfUserExists(userName)

    if (exists) {
      winston.info('Email already exists, redirecting to exists page')
      //res.send('EXISTS') // Switch to this to get better roundtrip timing numbers
      res.redirect(req.query.exists)
      return
    }

    await buildEnvironmentForUser(userName, password, email, lastName, firstName)
    await sendWelcomeEmail(email, firstName, lastName, userName)

  } catch(e){
    winston.warn('Something broke? Redirecting to failure \n',e)
    //res.send(e) // Switch to this to get better roundtrip timing numbers
    res.redirect(req.query.fail)
    return
  }

  //res.send('SUCCESS') // Switch to this to get better roundtrip timing numbers
  res.redirect(req.query.success || '/?state=success')
})

app.post('/changePassword', async (req, res) => {

  const {email, userName, password: newPassword, signature} = req.body

  if( !verifySignature(email+'|'+userName, signature)) {
    res.redirect(req.query.fail)
    return 
  }

  await resetUserPassword(userName, newPassword)
  res.redirect(req.query.success)
})

app.post('/deleteUser', async (req, res) => {

  const {email, userName, signature} = req.body

  if( !verifySignature(email+'|'+userName, signature)) {
    res.redirect(req.query.fail)
    return 
  }

  await deleteUser(userName)
  res.redirect(req.query.success)
})

app.listen(8080, () => winston.info('App listening'))