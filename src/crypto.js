const publicKey = process.env.publicKey

import crypto from 'crypto'

export function verifySignature(value, sig){

  // let pem = fs.readFileSync('PUBLIC_KEY_FILE_PATH_GOES_HERE')
  // let publicKey = pem.toString('ascii')
  const verifier = crypto.createVerify('RSA-SHA256')

  verifier.update(value, 'ascii')

  const publicKeyBuf = new Buffer(publicKey, 'ascii')
  const signatureBuf = new Buffer(sig, 'hex')
  const result = verifier.verify(publicKeyBuf, signatureBuf)

  return result
}