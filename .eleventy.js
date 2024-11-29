const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");

module.exports = function (eleventyConfig) {
  // Add RSS plugin
  eleventyConfig.addPlugin(pluginRss);

  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");

  // Collections
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md");
  });

  eleventyConfig.addCollection("archive", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/archive/*.md");
  });

  // Add date filter
  eleventyConfig.addFilter("dateFilter", function (date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("filterBy", function (array, property, value) {
    return array.filter((item) => {
      const props = property.split(".");
      let current = item;

      for (const prop of props) {
        current = current[prop];
      }

      return current === value;
    });
  });

  // Create markdown-it instance with footnotes plugin
  let markdownLibrary = markdownIt({
    html: true,
  }).use(markdownItFootnote);

  // Set as library for markdown files
  eleventyConfig.setLibrary("md", markdownLibrary);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
