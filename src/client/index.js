import CF from './cf.js'
import UAA from './uaa.js'
import CfHttp from './http_client.js'

const http_client = new CfHttp(
  'https://' + process.env.CF_API,
  'https://' + process.env.UAA_API,
  process.env.CF_ADMIN_USER,
  process.env.CF_ADMIN_PASS)

export const cf = new CF(http_client)
export const uaa = new UAA(http_client)