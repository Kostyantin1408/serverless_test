const {unknownPathMessage, editPost} = require("../../utils");


module.exports.edit_posts = async (event) => {
    let method = event.httpMethod;
  
    if (method !== "PUT") return unknownPathMessage();
  
  
    if (event.pathParameters && event.pathParameters.title) {
      let category = decodeURIComponent(event.pathParameters.category);
      let title = decodeURIComponent(event.pathParameters.title);
      return editPost(category, title, JSON.parse(event.body));
    } else {
      return unknownPathMessage();
    }
}
  