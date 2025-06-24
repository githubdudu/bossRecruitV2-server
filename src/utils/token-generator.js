/**
 * This is a functional jwt utils based on the jsonwebtoken library.
 *
 * Example to refresh tokens using https://github.com/auth0/node-jsonwebtoken
 * It was requested to be introduced at as part of the jsonwebtoken library,
 * since we feel it does not add too much value but it will add code to mantain
 * we won't include it.
 *
 * @credit ziluvatar
 * @link https://gist.github.com/ziluvatar/a3feb505c4c0ec37059054537b38fc48
 */
import jwt from "jsonwebtoken";

class TokenGenerator {
  constructor(secretOrPrivateKey, secretOrPublicKey, options) {
    this.secretOrPrivateKey = secretOrPrivateKey;
    this.secretOrPublicKey = secretOrPublicKey;
    this.options = options; //algorithm + keyid + noTimestamp + expiresIn + notBefore
  }
  sign(payload, signOptions) {
    const jwtSignOptions = Object.assign({}, signOptions, this.options);
    return jwt.sign(payload, this.secretOrPrivateKey, jwtSignOptions);
  }
  // refreshOptions.verify = options you would use with verify function
  // refreshOptions.jwtid = contains the id for the new token
  refresh(token, refreshOptions) {
    const payload = jwt.verify(token, this.secretOrPublicKey, refreshOptions.verify);
    delete payload.iat; // issue at
    delete payload.exp; // expiresIn
    delete payload.nbf; // notBefore
    delete payload.jti; //We are generating a new token, if you are using jwtid during signing, pass it in refreshOptions
    const jwtSignOptions = Object.assign({}, this.options, { jwtid: refreshOptions.jwtid });
    // The first signing converted all needed options into claims, they are already in the payload
    return jwt.sign(payload, this.secretOrPrivateKey, jwtSignOptions);
  }
  verify(token) {
    return jwt.verify(token, this.secretOrPublicKey);
  }
}

export default TokenGenerator;
