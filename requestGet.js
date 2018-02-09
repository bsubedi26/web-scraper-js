var request = require('request')

const requestGet = url => {
  return new Promise((resolve, reject) => {
    return request(url, (err, response, body) => {
      if (err) reject(err)
      return resolve(body)
    })
  })
}

module.exports = requestGet