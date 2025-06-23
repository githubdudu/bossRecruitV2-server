/**
 * This is cookie token generator which instantiates a TokenGenerator
 */
import TokenGenerator from "./token-generator";

const options = { expiresIn: "24h" };
const cookieTokenGenerator = new TokenGenerator(process.env.JWT_KEY, process.env.JWT_KEY, options);

export default cookieTokenGenerator;