const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItFootnote = require("markdown-it-footnote");
const { DateTime } = require("luxon");
const Image = require("@11ty/eleventy-img");
const path = require("path");
const fs = require("fs");

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

  // Override the default image renderer
  markdownLibrary.renderer.rules.image = function (
    tokens,
    idx,
    options,
    env,
    self
  ) {
    const token = tokens[idx];
    const src = token.attrs[token.attrIndex("src")][1];
    const alt = token.content;

    const cleanSrc = src.replace(/^\/img\//, "").replace(/^\/|\/$/g, "");
    const extension = path.extname(cleanSrc);
    const basename = path.basename(cleanSrc, extension);

    // Check which sizes exist by looking at the processed images
    const outputDir = "./_site/img/";
    const availableSizes = [];
    
    // Look for any processed images that match the pattern basename-XXXw
    try {
      const files = fs.readdirSync(outputDir);
      const pattern = new RegExp(`^${basename}-(\\d+)w\\.(webp|jpeg)$`);
      
      for (const file of files) {
        const match = file.match(pattern);
        if (match) {
          const width = parseInt(match[1]);
          if (!availableSizes.includes(width)) {
            availableSizes.push(width);
          }
        }
      }
      
      // Sort sizes from smallest to largest
      availableSizes.sort((a, b) => a - b);
    } catch (err) {
      // Fallback to checking standard sizes if directory read fails
      const possibleSizes = [300, 600, 900];
      for (const size of possibleSizes) {
        const webpPath = path.join(outputDir, `${basename}-${size}w.webp`);
        const jpegPath = path.join(outputDir, `${basename}-${size}w.jpeg`);
        if (fs.existsSync(webpPath) || fs.existsSync(jpegPath)) {
          availableSizes.push(size);
        }
      }
    }

    // Fallback to original image if no processed versions exist
    if (availableSizes.length === 0) {
      return `<img src="${src}" alt="${alt}" loading="lazy" decoding="async" class="w-full h-auto">`;
    }

    // Build srcset strings for available sizes
    const webpSrcset = availableSizes.map(size => `/img/${basename}-${size}w.webp ${size}w`).join(', ');
    const jpegSrcset = availableSizes.map(size => `/img/${basename}-${size}w.jpeg ${size}w`).join(', ');
    
    // Use the largest available size as the fallback
    const fallbackSize = Math.max(...availableSizes);

    return `
      <picture>
        <source
          type="image/webp"
          srcset="${webpSrcset}"
          sizes="(min-width: 1024px) 100vw, 50vw">
        <source
          type="image/jpeg"
          srcset="${jpegSrcset}"
          sizes="(min-width: 1024px) 100vw, 50vw">
        <img
          src="/img/${basename}-${fallbackSize}w.jpeg"
          alt="${alt}"
          loading="lazy"
          decoding="async"
          class="w-full h-auto">
      </picture>`;
  };

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

  // Add image shortcode with Tailwind classes
  eleventyConfig.addNunjucksAsyncShortcode(
    "image",
    async (src, alt, sizes, classes = "") => {
      let metadata = await Image("src" + src, {
        widths: [300, 600, 900],
        formats: ["webp", "jpeg"],
        urlPath: "/img/",
        outputDir: "./_site/img/",
      });

      let imageAttributes = {
        alt,
        sizes,
        class: classes,
        loading: "lazy",
        decoding: "async",
      };

      return Image.generateHTML(metadata, imageAttributes);
    }
  );

  // Add environment variable to eleventy data
  eleventyConfig.addGlobalData("eleventy", {
    env: process.env,
  });

  eleventyConfig.addPlugin(function (eleventyConfig) {
    // Process all images during build
    eleventyConfig.on("beforeBuild", async () => {
      const imageDir = "src/img";
      const files = fs.readdirSync(imageDir);

      for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
          await Image(path.join(imageDir, file), {
            widths: [300, 600, 900],
            formats: ["webp", "jpeg"],
            urlPath: "/img/",
            outputDir: "./_site/img/",
            filenameFormat: function (id, src, width, format) {
              const extension = path.extname(src);
              const name = path.basename(src, extension);
              return `${name}-${width}w.${format}`;
            },
          });
        }
      }
    });
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
