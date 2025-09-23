const express = require('express');
const _ = require('lodash');
const request = require('request');

const app = express();
const port = 3000;

// Vulnerable lodash usage (prototype pollution risks)
app.get('/merge', (req, res) => {
  const obj = {};
  _.merge(obj, JSON.parse(req.query.input || '{}'));
  res.json(obj);
});

// Insecure request library usage (deprecated)
app.get('/fetch', (req, res) => {
  const url = req.query.url || 'http://example.com';
  request(url, (err, response, body) => {
    if (err) return res.status(500).send('Error fetching URL');
    res.send(body);
  });
});

app.listen(port, () => {
  console.log(`Vulnerable app listening at http://localhost:${port}`);
});
