import express from 'express'

import {checkIfUserExists, buildEnvironmentForUser} from './cf_api.js'
import {sendWelcomeEmail} from './email.js'

const app = express()
app.use(express.urlencoded({}))


app.post('/addUser', async (req, res) => {

  console.log(req.body)
  try{
    const exists = await checkIfUserExists(req.body.email)

    if (exists) {
      console.log("Email already exists, redirecting to exists page")
      //res.send('EXISTS') // Switch to this to get better roundtrip timing numbers
      res.redirect(req.query.exists)
      return
    }

    const {stratos_url, getting_started_url, password} = await buildEnvironmentForUser(req.body.email)
    await sendWelcomeEmail(req.body.email, stratos_url, getting_started_url, password)

    console.log('Would send email here')
  } catch(e){
    console.log("Something broke? Redirecting to failure \n",e)
    //res.send(e) // Switch to this to get better roundtrip timing numbers
    res.redirect(req.query.fail)
    return
  }

  //res.send('SUCCESS') // Switch to this to get better roundtrip timing numbers
  res.redirect(req.query.success || '/?state=success')
})



app.listen(8080, () => console.log(`App listening`))