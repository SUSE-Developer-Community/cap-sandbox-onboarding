import express from 'express'

import cf from './cf_api.js'
import email from './email.js'

const app = express()
app.use(express.urlencoded({}))


app.post('/user', async (req, res) => {

  const sanitized_email = cf.buildOrgFromEmail(req.body.email)

  try{

    const exists = await cf.checkUserByEmail(email)

    if (exists) {
      console.log("Email already exists, redirecting to exists page")
      res.redirect(req.query.exists)
      return
    }

    const {stratos_url, getting_started_url} = await cf.addUserByEmail(sanitized_email)
    await email.sendWelcomeEmail(req.body.email, stratos_url, getting_started_url)

  } catch(e){
    console.log("Something broke? Redirecting to failure",e)
    res.redirect(req.query.fail)
    return
  }

  res.redirect(req.query.success || '/?state=success')
})



app.listen(8080, () => console.log(`App listening on port ${port}!`))