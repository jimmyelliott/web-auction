const bids = require("../controllers/bid.server.controllers")
const auth = require("../lib/authentication")

module.exports = function(app){

    app.route("/item/:item_id/bid")
    .post(auth.isAuthenticated, bids.bid_item);

    app.route("/item/:item_id/bid")
    .get(bids.get_bid_history);
}