import CF from './cf.js'

export const cf = new CF(
  'https://' + process.env.CF_API,
  'https://' + process.env.UAA_API,
  process.env.CF_USER,
  process.env.CF_PASS
)