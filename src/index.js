import express from 'express'

import {createUser, listUsersWithEmail, checkIfUserExists, buildEnvironmentForUser, changeUserPassword, deleteUser} from './cf_api.js'
import {sendWelcomeEmail} from './email.js'

import winston from  'winston'

winston.level = process.env.LOG_LEVEL || 'debug'
winston.add(new winston.transports.Console({
  format: winston.format.simple(),
  handleExceptions: true
}))

const buildOrgNameFromUsername = (username)=>(username.replace(new RegExp('\\W','g' ), '_'))



const app = express()
app.use(express.urlencoded({extended:true}))

app.use(express.json({}))

app.use((req, res, next)=>{
  if(req.headers.authorization == `Basic ${process.env.AUTH_TOKEN}` ) {
    next()
  } 
  else {
    winston.error('Failed login')
    res.send(403)
  }
})

app.post('/user/:email/:userName', async (req, res) => {
  const {email, userName} = req.params

  const {firstName, lastName, password} = req.body

  try{
    const exists = await checkIfUserExists(userName)

    if (exists) {
      winston.info('User already exists')
      res.send({status:409, message:'User already exists'})
      return
    }

    const user = await createUser(userName, email, password, lastName, firstName)
    await buildEnvironmentForUser(user.metadata.guid, buildOrgNameFromUsername(userName))

    await sendWelcomeEmail(email, firstName, lastName, userName)

  } catch(e){
    console.error(e)
    res.status(500).send(e)
    return
  }

  res.send(204)
})

app.put('/user/:email/:userName/password', async (req, res) => {

  const {email, userName} = req.params

  const {password: newPassword} = req.body

  try {
    await changeUserPassword(email, userName, newPassword)
  } catch (e){
    res.sendStatus(500)
  }
  res.sendStatus(204)
})

app.delete('/user/:email/:userName', async (req, res) => {

  const {email, userName} = req.params

  try {
    await deleteUser(email, userName, buildOrgNameFromUsername(userName))
  } catch (e){
    res.sendStatus(404)
  }
  res.sendStatus(204)
})

app.get('/user/:email', async (req, res) => {
  const {email} = req.params

  try {
    const users = await listUsersWithEmail(email)

    res.send(users)
  }catch (e){
    res.send(e)
  }
})

app.listen(8080, () => winston.info('App listening'))
