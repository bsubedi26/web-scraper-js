/**
 * External Dependencies
*/
var cheerio = require('cheerio')
var request = require('request')
var fs = require('fs')
var path = require('path')

/**
 * Internal Dependencies
*/
var initMongo = require('./mongo')
var delay = require('./delay')
var requestGet = require('./requestGet')


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

async function scrape_recursive(html) {
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
    var page = await requestGet(`${startingUrl}${nextHref}`)
    return scrape_recursive(page)
  }
  process.exit()
}

async function main(url) {
  global.db = await initMongo()
  var html = await requestGet(url)
  await scrape_recursive(html)

  // scrape completed. close mongo db  
  await delay(500)
  db.client.close()
}

// execute main function
main(startingUrl)

process.on('unhandledRejection', (err) => {
  console.log('.catch ', err)
  process.exit()
})