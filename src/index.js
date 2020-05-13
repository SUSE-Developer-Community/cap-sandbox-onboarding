import express from 'express'

import {createUser, listUsersWithEmail, checkIfUserExists, buildEnvironmentForUser, resetUserPassword, deleteUser} from './cf_api.js'
import {sendWelcomeEmail} from './email.js'
import {verifySignature} from './crypto.js'

import winston from  'winston'

winston.level = process.env.LOG_LEVEL || 'debug'
winston.add(new winston.transports.Console({
  format: winston.format.simple(),
  handleExceptions: true
}))

const buildOrgNameFromUsername = (username)=>(username.replace(new RegExp('\\W','g' ), '_'))



const app = express()
app.use(express.urlencoded({extended:true}))

app.use((req, res, next)=>{
  //TODO make this whatever verification we need. For now, using token.



  if(verifySignature(req.body.email, req.body.emailSignature)) {
    next()
  } else {
    next({status:401, message:'Email and signature did not match'})
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
      winston.info('User already exists')
      res.send(409).send({status:409, message:'User already exists'})
      return
    }


    const user = await createUser(userName, password, email, lastName, firstName)
    await buildEnvironmentForUser(user.metadata.guid, buildOrgNameFromUsername(userName))

    await sendWelcomeEmail(email, firstName, lastName, userName)

  } catch(e){
    winston.warn('Something broke? Redirecting to failure \n',e)
    res.send(500).send(e)
    return
  }

  res.send(204)
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

app.get('/user/:email', async (req, res) => {
  const {email} = req.params

  const users = await listUsersWithEmail(email)
  res.send(users)
})

app.listen(8080, () => winston.info('App listening'))