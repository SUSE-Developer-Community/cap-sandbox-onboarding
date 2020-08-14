import CF from './cf.js'
import UAA from './uaa.js'
import CfHttp from './http_client.js'
import UaaHttp from './http_client_uaa.js'


const getService = (type, name)=>(
  JSON.parse(process.env['VCAP_SERVICES'])[type]
    .find((service)=>(service.name==name))
)

const cf_api = getService('user-provided', 'cf_api').credentials
const uaa_api = getService('user-provided', 'uaa_api').credentials



const http_client = new CfHttp(
  'https://' + cf_api.uri,
  'https://' + uaa_api.uri,
  cf_api.user,
  cf_api.password)

const http_client_uaa = new UaaHttp(
  'https://' + cf_api.uri,
  'https://' + uaa_api.uri,
  uaa_api.client_id,
  uaa_api.client_secret)

export const cf = new CF(http_client)
export const uaa = new UAA(http_client_uaa)