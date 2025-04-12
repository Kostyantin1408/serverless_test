const {generatePolicy} = require("../utils")

module.exports.user_authorizer = async (event) => {
    const token = event.authorizationToken;
  
    if (!token || token !== process.env.TOKEN) {
      return generatePolicy("anonymous", "Deny", event.methodArn);
    }
    return generatePolicy("user", "Allow", "*", { userId: "xxx" })
}