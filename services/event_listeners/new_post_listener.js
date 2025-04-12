const {increseCategoryCounter} = require("../../utils");


module.exports.new_post_event_listener = async (event, context) => {
    const category = event.detail.category;
    return increseCategoryCounter(category);
}
