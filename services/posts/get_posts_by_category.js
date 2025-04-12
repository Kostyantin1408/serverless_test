const {unknownPathMessage, getPostsByCategory} = require("../../utils");


module.exports.get_posts_by_category = async (event) => {
    let method = event.httpMethod;
    if (method !== "GET") return unknownPathMessage();
  
    if (event.pathParameters && event.pathParameters.category) {
      let category = decodeURIComponent(event.pathParameters.category);
      return getPostsByCategory(category);
    } else {
      return unknownPathMessage();
    }
}