const express = require('express');
const _ = require('lodash');

const app = express();
const port = 3000;

// Example vulnerable code: unsanitized input
app.get('/greet', (req, res) => {
  const name = req.query.name || "World";
  res.send("Hello " + name);
});

app.listen(port, () => {
  console.log(`Sample app listening at http://localhost:${port}`);
});
