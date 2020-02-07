
import express from 'express'

const app = express()
app.use(express.urlencoded({}))
app.set('view engine', 'ejs');

// Only show this page while developing
if(process.env.SHOW_INDEX){
  app.get('/', (req, res) => {

    res.render('index', req.query)
  })
}

// TODO
const sanitizeEmail = (email)=>(email)


app.post('/user', (req, res) => {

  const sanitized_email = sanitizeEmail(req.body.email)
  if (! sanitized_email) {
    console.log("Email didn't sanitize? Redirecting to failure")
    res.redirect(req.query.fail || '/?state=fail')
    return
  }

  if (CF.checkUserByEmail(sanitized_email)) {
    console.log("Email already exists, redirecting to exists page")
    res.redirect(req.query.exists || '/?state=exists')
    return
  }

  try{
    CF.queueAddUserByEmail(sanitized_email)
  } catch(e){
    console.log("Something broke? Redirecting to failure")
    res.redirect(req.query.fail || '/?state=fail')
    return
  }

  res.redirect(req.query.success || '/?state=success')
})

app.listen(8080, () => console.log(`App listening on port ${port}!`))
