const {unknownPathMessage, addPost} = require("../../utils");

module.exports.add_post = async (event) => {
    let path = event.path;
    let method = event.httpMethod;
  
    switch (path) {
      case "/add_post":
        if (method === "POST") {
          return addPost(JSON.parse(event.body));
        } else {
          return {
            statusCode: 405,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            message: "You can use /add_post only with POST method!",}),
          }
        }
        break;
      default:
        return unknownPathMessage();
        break;
    }
};