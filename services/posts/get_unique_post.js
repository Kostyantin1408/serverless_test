const {unknownPathMessage, getGivenPost} = require("../../utils");


module.exports.get_unique_post = async (event) => {
  let method = event.httpMethod;

  if (method !== "GET") return unknownPathMessage();

  if (event.pathParameters && event.pathParameters.title) {
    let title = decodeURIComponent(event.pathParameters.title);
    return getGivenPost(title);
  }
}

