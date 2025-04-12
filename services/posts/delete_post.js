const {unknownPathMessage, deletePost} = require("../../utils");


module.exports.delete_post = async (event) => {
    let method = event.httpMethod;
  
    if (method !== "DELETE") return unknownPathMessage();
  
  
    if (event.pathParameters && event.pathParameters.title) {
      let category = decodeURIComponent(event.pathParameters.category);
      let title = decodeURIComponent(event.pathParameters.title);
      return deletePost(category, title);
    } else {
      return unknownPathMessage();
    }
}