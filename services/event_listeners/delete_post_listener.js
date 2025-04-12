const {decreaseCategoryCounter} = require("../../utils");

module.exports.delete_post_event_listener = async (event, context) => {
    const category = event.detail.category;
    return decreaseCategoryCounter(category);
}
