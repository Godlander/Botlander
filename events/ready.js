const config = require("../config.json");
const remind = require("../actions/remindme");

module.exports = async (client) => {
    console.log("\nhihixd");
    remind.reset(client);
};