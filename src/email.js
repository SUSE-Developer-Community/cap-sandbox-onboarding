import AWS from 'aws-sdk'
AWS.config.update({
  region: process.env.SES_REGION,
  accessKeyId: process.env.SES_ACCESS_KEY,
  secretAccessKey: process.env.SES_SECRET_KEY
});

const template_name = process.env.SES_WELCOME_TEMPLATE
const sender_email = process.env.SES_SENDER

const SES = new AWS.SES({apiVersion: '2010-12-01'})


export const  sendWelcomeEmail = async (email) => {

  try{
    const config = buildConfig(email)
    await SES.sendTemplatedEmail(config).promise()
  } catch (e) {
    console.error("Error sending Email", e)
    throw e
  }
}

// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/ses-examples-sending-email.html
const buildConfig = (to_address)=>(
  {
    Destination: {
      ToAddresses: [
        to_address
      ]
    },
    Source: sender_email,
    Template: template_name,
    TemplateData: JSON.stringify({stratos_url:'https://stratos.cap.explore.suse.dev', firstlook_url:'https://gettingstarted.cap.explore.suse.dev'}),
    ReplyToAddresses: [
      "NO_REPLY@explore.suse.dev"
    ]
  }  
)