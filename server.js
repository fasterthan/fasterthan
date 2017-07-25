// Libraries
const bodyParser = require('body-parser')
const express = require('express')
const https = require('https')
const fs = require('fs')

// Static HTML files
const privacy = fs.readFileSync('views/privacy.html')

// Ports
const port = process.env.PORT || 8080
const ip = process.env.IP   || '0.0.0.0'


// Express app
const app = express()

// Serve static files
app.use(express.static('public'))

// Allow parsing of incoming XMLhttprequests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  console.log('user connected')
  console.log(req.query.code)
})

app.get('/quotes', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

app.get('/login', (req, res) => {
  res.redirect('https://www.instagram.com/oauth/authorize/?client_id=77670228764a4e71ae8d39403e87447f&redirect_uri=http://localhost:8080&response_type=code')
})

function instagramAuthorization(callback) {
  https.get('https://www.instagram.com/oauth/authorize/?client_id=77670228764a4e71ae8d39403e87447f&redirect_uri=https://fasterthan.me&response_type=code', resp => {
    const statusCode = resp.statusCode;
    console.log(statusCode)
    const contentType = resp.headers['content-type']

    let error
    if (statusCode !== 200)
      error = new Error(`Request Failed.\n` + `Status Code: ${statusCode}`)
    else if (!/^application\/json/.test(contentType))
      error = new Error(`Invalid content-type.\n` + `Expected application/json but received ${contentType}`)
    
    if (error) {
      console.log(error.message)
      resp.respume()
      return
    }

    resp.setEncoding('utf8')
    let rawData = ''
    resp.on('data', chunk => rawData += chunk)
    resp.on('end', () => {
      try {
        callback(rawData)
      } catch (e) {
        console.log(e.message)
      }
    })
  }).on('error', e => { console.log(`Got error: ${e.message}`)})
}
// https://www.instagram.com/oauth/authorize/?client_id=77670228764a4e71ae8d39403e87447f&redirect_uri=https://fasterthan.me&response_type=code
app.get('/api/david', (req, res) => {
  if (req.headers.loaded)
    res.send(JSON.stringify(David))

  else res.redirect('/')
})

// Requests to any URL not defined is sent a 404
app.get('*', (req, res) => {
  res.status(404).send("<h1>404</h1><p>The page you're requesting doesn't exist")
})
app.listen(port, () => {
  console.log("Server started at http://localhost:" + port)
})

function connectMongo(mode, model, callback) {
  mongoose.connect('mongodb://genericos:retsfa@ds151461.mlab.com:51461/faster/quotes')
  db = mongoose.connection

  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', () => {
    console.log("Connection to Mongo database established")

    switch (mode) {
      case 'save':
        model.save()
        mongoose.disconnect()
      break

      case 'getFaster':
        model.findOne({ isFaster: true }).sort({date: -1}).exec( (err, documents) => {
          mongoose.disconnect()
          if (err) return console.error(err)
        
          callback(documents.quote)
        })
      break

      case 'getAll':
        model.find((err, documents) => {
          mongoose.disconnect()
          if (err) return console.error(err)
        
          callback(documents)
        })
      break
    }
  })
}

function writeCSV() {
  fetchInsta( rawData => {
    let line = "thumbnailUrl,Url,likes\n"
      for (let i = 0; i < rawData.data.length; i++) {
        line += rawData.data[i].images.low_resolution.url + ',' + rawData.data[i].link + ',' + rawData.data[i].likes.count + '\n'
      }

    fs.writeFile('ig.csv', line, err => {
      if (err) throw err
    })
  })
}

function fetchInsta(callback) {
  https.get('https://api.instagram.com/v1/users/self/media/recent/?access_token=2343501318.7767022.c73f1316ae944651b78adb3b2f18fff7', resp => {
    const statusCode = resp.statusCode;
    const contentType = resp.headers['content-type']

    let error
    if (statusCode !== 200)
      error = new Error(`Request Failed.\n` + `Status Code: ${statusCode}`)
    else if (!/^application\/json/.test(contentType))
      error = new Error(`Invalid content-type.\n` + `Expected application/json but received ${contentType}`)
    
    if (error) {
      console.log(error.message)
      resp.respume()
      return
    }

    resp.setEncoding('utf8')
    let rawData = ''
    resp.on('data', chunk => rawData += chunk)
    resp.on('end', () => {
      try {
        callback(JSON.parse(rawData))
      } catch (e) {
        console.log(e.message)
      }
    })
  }).on('error', e => { console.log(`Got error: ${e.message}`)})
}

let Phia = {
  "name": "Sophia Maria Holmgren",
  "photo": "https://scontent-atl3-1.cdninstagram.com/t51.2885-19/s320x320/14727646_1169168589834186_6905304133377458176_a.jpg",
  "major": "Art",
  "degree": "associate student",
  "school": "Sacramento City College",
  "googleID": "none",
  "style": {
    "font": {
      "family": "sans-serif",
      "alignment": "center",
      "color": "#cc3300"
    },
    "colors": {
      "accent": "pink",
      "background": "#f5f5f0"
    },
    "icon": "❀"
  }
}
let David = {
  "name": "David Alexander Foster",
  "photo": "/images/avatar_240.png",
  "major": "Computer science",
  "degree": "undergraduate",
  "school": "UC Davis",
  "googleID": "l3BrFHMCWeUnr4pM3QZXyHk1dxsysnkdWLmEJRw9mYo",
  "style": {
    "font": {
      "family": "sans-serif",
      "alignment": "center",
      "color": "#444"
    },
    "colors": {
      "accent": "#4d6394",
      "background": "#e6e6ff"
    },
    "icon": "F >"
  }
}