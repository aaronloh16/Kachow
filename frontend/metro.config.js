// metro.config.js (in the root of your frontend project)
const { getDefaultConfig } = require("@expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  "@": path.resolve(__dirname),
};

module.exports = config;
