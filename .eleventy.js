const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");
const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  // Add RSS plugin
  eleventyConfig.addPlugin(pluginRss);

  // Copy static assets
  // eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/site.webmanifest");

  // Collections
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").map((post) => {
      // Ensure permalink starts with / and ends with /
      post.data.permalink = `/${post.fileSlug.replace(/^\/|\/$/g, "")}/`;
      return post;
    });
  });

  eleventyConfig.addCollection("archive", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/archive/*.md").map((item) => {
      // Ensure permalink starts with / and ends with /
      item.data.permalink = `/${item.fileSlug.replace(/^\/|\/$/g, "")}/`;
      return item;
    });
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

  // Watch for Tailwind CSS changes
  eleventyConfig.addWatchTarget("./src/css/");
  eleventyConfig.addWatchTarget("./_site/css/styles.css");

  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
      "dd LLL yyyy"
    );
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // Add metadata
  eleventyConfig.addGlobalData("metadata", {
    url: "https://craigsturgis.com",
    title: "Craig Sturgis",
    description: "Personal website of Craig Sturgis",
    feed: {
      subtitle: "I write sometimes. Here it is.",
      filename: "feed.xml",
      path: "/feed.xml",
      id: "https://craigsturgis.com/",
    },
    author: {
      name: "Craig Sturgis",
      email: "craig@craigsturgis.com",
    },
  });

  // Add absolute URL filter
  eleventyConfig.addFilter("absoluteUrl", (url, base) => {
    try {
      return new URL(url, base).toString();
    } catch (e) {
      console.error(`Error resolving absolute URL: ${url} using base ${base}`);
      return url;
    }
  });

  // Add this new feed configuration
  eleventyConfig.addPlugin(pluginRss, {
    posthtmlRenderOptions: {
      closingSingleTag: "slash",
    },
  });

  eleventyConfig.addFilter("dateToISO", function (date) {
    return date instanceof Date
      ? date.toISOString()
      : new Date(date).toISOString();
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
    },
    permalinkBypassOutputDir: true,
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
