require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Middleware to parse POST request body
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Mock database to store URLs (in-memory)
let urlDatabase = {};
let urlCounter = 1;

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// POST endpoint to create a short URL
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  try {
    // Use the URL constructor to parse and validate the URL
    const parsedUrl = new URL(url);

    // Validate that the protocol is either http or https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.json({ error: 'invalid url' });
    }

    // Save the URL in the mock database
    const shortUrl = urlCounter++;
    urlDatabase[shortUrl] = url;

    // Respond with the original and short URL
    res.json({ original_url: url, short_url: shortUrl });
  } catch (err) {
    // Catch any errors and respond with an invalid URL message
    return res.json({ error: 'invalid url' });
  }
});

// GET endpoint to redirect based on the short URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url, 10);

  // Check if the short URL exists in the database
  const originalUrl = urlDatabase[shortUrl];
  if (!originalUrl) {
    return res.status(404).json({ error: 'No short URL found for the given input' });
  }

  // Redirect to the original URL
  res.redirect(originalUrl);
});

// Start the server
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
