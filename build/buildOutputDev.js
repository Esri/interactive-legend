const fs = require("fs-extra");
const copydir = require("copy-dir");

const distDir = "./dist";

const distConfig = "./dist/config";

// assets/images path
const distAssetsDir = "./dist/assets";
const distAssetsImagesDir = "./dist/assets/images";

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

if (!fs.existsSync(distConfig)) {
  fs.mkdirSync(distConfig);
}

if (!fs.existsSync(distAssetsDir)) {
  fs.mkdirSync(distAssetsDir);
}

if (!fs.existsSync(distAssetsImagesDir)) {
  fs.mkdirSync(distAssetsImagesDir);
}

fs.copySync("./index.html", "./dist/index.html");
fs.copySync("./oauth-callback.html", "./dist/oauth-callback.html");

copydir.sync("./devConfig", "./dist/config");

copydir.sync("./assets", "./dist/assets");

copydir.sync("./calcite-web-1.2.5", "./dist/calcite-web-1.2.5");
