const mjmlUtils = require("mjml-utils");
const path = require("path");
const replyTemplatePath = path.join(
  __dirname,
  "../public/templates/replyTemplate.html"
);

const replyTemplate = async (message) => {
  const html = await mjmlUtils.inject(replyTemplatePath, {
    message,
  });
  return html;
};

module.exports = {replyTemplate}
