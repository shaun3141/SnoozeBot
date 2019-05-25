
exports.getApp = function() {
  let appHtml = "";
  appHtml = "<ul><li>Some html here</li></ul>";

  return JSON.stringify({"html": appHtml});
}