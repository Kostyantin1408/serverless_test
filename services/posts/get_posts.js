const {unknownPathMessage, getAllEntries} = require("../../utils");


module.exports.get_posts = async (event) => {
    let path = event.path;
    let method = event.httpMethod;
  
    if (method !== "GET") return unknownPathMessage();
  
    if (path === "/posts") {
      return getAllEntries("posts_with_categories");
    } else {
      return unknownPathMessage();
    }
}