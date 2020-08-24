import logger from  'winston'

import AWS from 'aws-sdk'


const getService = (type, name)=>(
  JSON.parse(process.env['VCAP_SERVICES'])[type]
    .find((service)=>(service.name==name))
)
const aws_ses = getService('user-provided', 'aws_ses').credentials

AWS.config.update({
  region: aws_ses.region,
  accessKeyId: aws_ses.access_key,
  secretAccessKey: aws_ses.secret_key
})

const template_name = process.env.SES_WELCOME_TEMPLATE
const sender_email = aws_ses.sender

const SES = new AWS.SES({apiVersion: '2010-12-01'})


export const  sendWelcomeEmail = async (email, firstName, lastName, username) => {
  logger.debug('Sending Email with: ', [email, firstName, lastName, username])

  try{

    const config = buildConfig(email, firstName)
    await SES.sendTemplatedEmail(config).promise()

  } catch (e) {
    logger.error('Error sending Email', e)
    throw e
  }
}


// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/ses-examples-sending-email.html
const buildConfig = (to_address, first_name)=>(
  {
    Destination: {
      ToAddresses: [
        to_address
      ]
    },
    Source: sender_email,
    Template: template_name,
    TemplateData: JSON.stringify({first_name}),
    ReplyToAddresses: [
      'NO_REPLY@explore.suse.dev'
    ]
  }  
)