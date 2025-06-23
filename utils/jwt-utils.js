/**
 * This is a functional jwt utils based on the jsonwebtoken library. 
 */
import jwt from "jsonwebtoken";

/**
 * Verifies the given JWT token and gets the payyload from it. Throws an error if the JWT is invalid or expired, or there's
 * no username in the token.
 *
 * @param {string} token the token to verify
 *
 * @author Dewey Dong
 * @credit Andrew Meads
 */
export function getPayloadFromJWT(token) {
  // Decode token; will throw an error if the token is invalid or expired.
  const decoded = jwt.verify(token, process.env.JWT_KEY);
  if (!decoded) throw `JWT is valid but did not contain a payload.`;
  return decoded;
}

/**
 * Creates a new JWT for the user with the given payload, with the given expiry time (defaults to 24 hours).
 *
 * Ideally, the expiry time should match the expiry time of the HTTP-only cookie it will be stored in, but doesn't
 * matter too much if not (they will both be checked separately).
 *
 * Feel free to use this function or modify it in your own programs (credit the author!).
 *
 * @param {Object} payload the payload to include in the token
 * @param {string} expiresIn when this token expires (defaults to 24 hours)
 *
 * @author Andrew Meads
 */
export function createJWT(payload, expiresIn = "24h") {
  return jwt.sign(payload, process.env.JWT_KEY, { expiresIn });
}