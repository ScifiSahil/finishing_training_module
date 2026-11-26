const configModule = require(process.env.WEBPACK_CONFIG_COMMON);
const commonConfig = configModule.makeConfig();

// Rule for pictures: embeds .webp files inside the JS bundle (no separate file paths needed)
const imageRule = { test: /\.webp$/, type: "asset/inline" };

const commonRules =
  commonConfig.module && commonConfig.module.rules ? commonConfig.module.rules : [];

module.exports = Object.assign({}, commonConfig, {
  module: Object.assign({}, commonConfig.module, {
    rules: [...commonRules, imageRule],
  }),
});