# Wonderit Design Atelier

A responsive, single-page portfolio built with plain HTML, CSS and vanilla JavaScript. It has no package install or build step. Uploaded design art is shown from local, web-optimized JPEG copies.

## Run locally

- Double-click `index.html` to open it in a modern browser.
- Or open this folder in VS Code and choose **Go Live** with the Live Server extension.

## Add a design or product

1. Put your optimized image in `images/designs/optimized/` or `images/products/optimized/`.
2. Add one object to `window.GALLERY_ITEMS` in `js/gallery-data.js`. For example:

   ```js
   { file: "images/designs/optimized/logo-02.jpg", title: "Logo for Acme", description: "A short note about the project.", category: "Logos", type: "design" }
   ```

   Product items use `type: "product"` and include a short product description. Design filter buttons are generated automatically from the design categories. Use one of `Logos`, `Flyers`, `Branding`, `Social Media` or `Other`, or add your own category.
3. Use a meaningful title and description; these are shown in the lightbox and used for image alt text. Images load lazily. The uploaded design originals remain in `images/designs/`, and their optimized copies are in `images/designs/optimized/`. Product originals remain in `images/products/`, with optimized copies in `images/products/optimized/`.

The galleries currently include 34 design pieces and six Culmino Labs product and brand mockups. Categories are assigned in `js/gallery-data.js` based on the artwork: logos, flyers, branding, social media, and other design formats.

Recommended image size: about 1200px wide, compressed JPG or WebP, under 300 KB. SVG can also be used for vector artwork.

## Change contact details and colours

Edit the single `window.SITE_CONFIG` object at the top of `js/config.js`. It contains the brand name, tagline, WhatsApp number (digits only, international format without `+`), email, Instagram username, form endpoint and the `colors` palette (`navy`, `cyan`, `white`). The site applies these colors to its CSS variables. Other layout variables and font choices are at the top of `css/style.css`.

The provided WhatsApp number is `2349037109835`, taken from the example number in the project brief. Replace it with the correct number before publishing if that was only illustrative.

## Set up the contact form

The form has client-side required-field and email validation, a sending state, and success/error feedback. Create a form with your provider (for example Formspree or Web3Forms), then replace `formEndpoint` in `js/config.js` with its submission URL. The form submits `name`, `email` and `message` using `fetch` and expects a successful HTTP response. Until configured, submission shows a note directing visitors to WhatsApp, email or Instagram.

## Deploy for free

This is a static site. Upload the project folder as-is to Netlify or Vercel, or push it to a GitHub repository and enable GitHub Pages. Set the site root to the folder containing `index.html`; no build command is required. Verify the deployed contact endpoint and links before sharing the URL.
