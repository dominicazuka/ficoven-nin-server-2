const mjmlUtils = require("mjml-utils");
const path = require("path");
const replyTemplatePath = path.join(
  __dirname,
  "../public/templates/replyTemplateAdmin.html"
);

const replyTemplateAdmin = async (message) => {
  const html = await mjmlUtils.inject(replyTemplatePath, {
    message,
  });
  return html;
};

module.exports = {replyTemplateAdmin}
