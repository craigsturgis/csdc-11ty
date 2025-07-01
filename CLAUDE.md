# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm start` - Start development server with live reload and CSS watching
- `npm run build` - Build the site and compile CSS for production

### Build Process
The site uses Eleventy (11ty) as the static site generator with:
- Tailwind CSS for styling (processed via PostCSS)
- Automatic image preprocessing to multiple formats and sizes
- RSS feed generation

## Architecture Overview

This is an Eleventy-based personal blog/website with the following structure:

### Content Organization
- **Posts**: Modern blog posts in `src/posts/` 
- **Archive**: Older posts in `src/archive/`
- **Static pages**: Contact, about, etc. as individual `.njk` files in `src/`

### Key Technical Components

#### Image Processing
- All images in `src/img/` are automatically processed during build
- Generates WebP and JPEG formats in multiple sizes (300w, 600w, 900w)
- Markdown images are automatically converted to responsive `<picture>` elements
- Custom image shortcode available: `{% image "/img/filename.jpg", "Alt text", "sizes attribute", "css classes" %}`

#### Collections
- `posts` collection: All files in `src/posts/*.md`
- `archive` collection: All files in `src/archive/*.md`
- Both collections automatically generate proper permalinks

#### Templating
- Uses Nunjucks templating engine
- Base layout in `src/_includes/layouts/base.njk`
- Post layout extends base layout
- Custom macros for reusable components in `src/_includes/macros/`

#### CSS & Styling
- Tailwind CSS with typography plugin
- Dark mode support via media queries
- Styles compiled from `src/css/styles.css` to `_site/css/styles.css`

#### Markdown Features
- Markdown-it with footnote support
- Custom image rendering that generates responsive images
- HTML allowed in markdown

### Configuration Files
- `.eleventy.js` - Main Eleventy configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration for Tailwind processing

### Deployment
- Hosted on Netlify
- Build command: `npm run build`
- Output directory: `_site`