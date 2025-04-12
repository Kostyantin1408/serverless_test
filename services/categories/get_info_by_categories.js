const {unknownPathMessage, getCategoryCounters} = require("../../utils");


module.exports.get_info_by_categories = async (event) => {
    let method = event.httpMethod;
    if (method !== "GET") return unknownPathMessage();
    return getCategoryCounters();
}