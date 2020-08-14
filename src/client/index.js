import CF from './cf.js'
import UAA from './uaa.js'
import CfHttp from './http_client.js'

import qs from 'qs'


const getService = (type, name)=>(
  JSON.parse(process.env['VCAP_SERVICES'])[type]
    .find((service)=>(service.name==name))
)

const cf_api = getService('user-provided', 'cf_api').credentials
const uaa_api = getService('user-provided', 'uaa_api').credentials



const http_client = new CfHttp(
  'CF',
  'https://' + cf_api.uri,
  {
    url: `https://${uaa_api.uri}/oauth/token`,
    method: 'post',
    headers: {
      Authorization: 'Basic Y2Y6',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    data: qs.stringify({
      grant_type: 'password',
      client_id: 'cf',
      username: cf_api.user,
      password: cf_api.password
    })
  })


const http_client_uaa = new CfHttp(
  'UAA',
  'https://' + uaa_api.uri,
  {
    url: `https://${uaa_api.uri}/oauth/token`,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    data: qs.stringify({
      grant_type: 'client_credentials',
      client_id: uaa_api.client_id,
      client_secret: uaa_api.client_secret
    })
  }
)

export const cf = new CF(http_client)
export const uaa = new UAA(http_client_uaa)