const {unknownPathMessage, addCategory} = require("../../utils");


module.exports.add_category = (event) => {
    let method = event.httpMethod;
    if (method !== "POST") return unknownPathMessage();
  
    return addCategory(JSON.parse(event.body));
}

