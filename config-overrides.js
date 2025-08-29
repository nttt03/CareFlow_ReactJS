const { override, addWebpackResolve } = require("customize-cra");

module.exports = override(
  addWebpackResolve({
    fallback: {
      url: require.resolve("url/"),
      buffer: require.resolve("buffer/"),
    },
  })
);
