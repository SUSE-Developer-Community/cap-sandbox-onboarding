


export const  sendWelcomeEmail = async (email, stratos_url, getting_started_url, password, firstName, lastName, username, role, country) => {

  try{
    console.log('will email with ', email, stratos_url, getting_started_url, password, firstName, lastName, username, role, country)

    //TODO add marketo form when provided

  } catch (e) {
    console.error('Error sending Email', e)
    throw e
  }
}
