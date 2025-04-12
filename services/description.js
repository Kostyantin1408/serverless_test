const {unknownPathMessage} = require("../utils")

module.exports.description = async (event) => {
    let method = event.httpMethod;
  
    if (method !== "GET") return unknownPathMessage();
  
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Hello! This is app for your blog! You can add posts here and observe them!",
      }),
    };
};
  
  