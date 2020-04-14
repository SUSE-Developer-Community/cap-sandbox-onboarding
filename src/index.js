import express from 'express'

import {checkIfUserExists, buildEnvironmentForUser, loadSampleApp} from './cf_api.js'
import {sendWelcomeEmail} from './email.js'

const app = express()
app.use(express.urlencoded({}))

// loadSampleApp().then(()=>{
//   console.log('Sample App loaded')
// }).catch((err)=>{
//   console.error(err)
// })


app.post('/addUser', async (req, res) => {

  try{
    const exists = await checkIfUserExists(req.body.email)

    if (exists) {
      console.log("Email already exists, redirecting to exists page")
      //res.send('EXISTS') // Switch to this to get better roundtrip timing numbers
      res.redirect(req.query.exists)
      return
    }

    await buildEnvironmentForUser(userName, password, email, lastName, firstName)
    await sendWelcomeEmail(email, firstName, lastName, userName)

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