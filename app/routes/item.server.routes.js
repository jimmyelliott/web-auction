const items = require("../controllers/item.server.controllers")
const auth = require("../lib/authentication")

module.exports = function(app){

    app.route("/search")
    .get(items.search);

    app.route("/item")
    .post(auth.isAuthenticated, items.create_item);

    app.route("/item/:item_id")
    .get(items.get_item);
}