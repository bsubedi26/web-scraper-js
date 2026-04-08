# web-scraper-js

Node.js scraper for XKCD comics. It walks backward through comic pages, downloads each comic image to disk, and can store comic metadata in MongoDB.

## What It Does

- Starts from the latest XKCD comic page
- Follows the previous-comic link recursively
- Extracts the comic title, image URL, and alt text
- Saves images into `xkcd_images/`
- Includes a MongoDB-backed Puppeteer version for storing metadata

## Project Structure

- `index.js`: HTTP + Cheerio scraper that downloads images
- `puppeteer.js`: Browser-automation version that downloads images and writes metadata to MongoDB
- `mongo.js`: MongoDB connection helper
- `requestGet.js`: Promise wrapper around `request`

## Install

```bash
npm install
```

## Run

Download images with the lightweight scraper:

```bash
node index.js
```

Run the browser-automation version with MongoDB storage:

```bash
node puppeteer.js
```
