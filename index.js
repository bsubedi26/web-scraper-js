/**
 * External Dependencies
*/
var puppeteer = require('puppeteer')
var cheerio = require('cheerio')
var request = require('request')
var fs = require('fs')
var path = require('path')

/**
 * Internal Dependencies
*/
var initMongo = require('./mongo')
var delay = require('./delay')


var startingUrl = 'https://www.xkcd.com'

function parse(html) {
  var $ = cheerio.load(html)
  var title = $('#ctitle').text()
  var image = $('#comic img').attr('src')
  var imageTitle = $('#comic img').attr('title')
  var nextHref = $('a[accesskey=p]').attr('href')

  var payload = {
    title,
    image,
    imageTitle,
    nextHref
  }
  return Promise.resolve(payload)
}

async function scrape_recursive(page) {
  var html = await page.evaluate(() => document.body.innerHTML);
  const { title, image, imageTitle, nextHref } = await parse(html)
  await db.collection('xkcd').insert({ title, image, imageTitle, nextHref })
  var linkHref = nextHref.replace(/\//g,'');

  var imageUrl = 'https:' + image
  var filename = image.replace(/^.*[\\\/]/, '')

  request(imageUrl)
  .pipe(fs.createWriteStream(path.join(__dirname, 'xkcd_images', `${filename}`)))  

  if (parseInt(linkHref) >= 1) {
    console.log(`Scraping url ${startingUrl}${nextHref}`)
    $prevLink = 'a[accesskey=p]'
    await page.click($prevLink)
    await delay(300)
    return scrape_recursive(page)
  }
  process.exit()
}

async function main(url) {
  global.db = await initMongo()
  var browser = await puppeteer.launch({ headless: true })
  var page = await browser.newPage()
  await page.goto(url)
  await scrape_recursive(page)
 
  // scrape completed. close browser and mongo db  
  await delay(1000)
  browser.close()
  db.client.close()
}

// execute main function
main(startingUrl)

process.on('unhandledRejection', (err) => {
  console.log('.catch ', err)
  process.exit()
})