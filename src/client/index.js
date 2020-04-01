import CF from './cf.js'


// need to move init to consumer responsibility and pull env out of client lib
export const cf = new CF(
  'https://' + process.env.CF_API,
  'https://' + process.env.UAA_API,
  process.env.CF_ADMIN_USER,
  process.env.CF_ADMIN_PASS
)