require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// In-memory storage for URL data
let urlDatabase = [];
let idCounter = 1;

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Endpoint to shorten URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  
  // Validate URL
  try {
    const urlObj = new URL(originalUrl);
    dns.lookup(urlObj.hostname, (err) => {
      if (err) return res.json({ error: 'invalid url' });
      
      // Generate and store short URL
      const shortUrl = idCounter++;
      urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });
      
      // Return the shortened URL data
      res.json({ original_url: originalUrl, short_url: shortUrl });
    });
  } catch {
    res.json({ error: 'invalid url' });
  }
});

// Endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);
  
  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Start the server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});