import CF from './cf.js'
import UAA from './uaa.js'
import CfHttp from './http_client.js'
import UaaHttp from './http_client_uaa.js'

const http_client = new CfHttp(
  'https://' + process.env.CF_API,
  'https://' + process.env.UAA_API,
  process.env.CF_ADMIN_USER,
  process.env.CF_ADMIN_PASS)

const http_client_uaa = new UaaHttp(
  'https://' + process.env.CF_API,
  'https://' + process.env.UAA_API,
  process.env.UAA_ADMIN_CLIENT_ID,
  process.env.UAA_ADMIN_SECRET)

export const cf = new CF(http_client)
export const uaa = new UAA(http_client_uaa)