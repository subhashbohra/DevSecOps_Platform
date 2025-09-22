const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

router.get('/ping', (req, res) => {
  // VULN: command injection — user input inserted into system command
  const host = req.query.host || '127.0.0.1';
  exec('ping -c 1 ' + host, (error, stdout, stderr) => {
    if (error) return res.status(500).send('Error');
    res.send(`<pre>${stdout}</pre>`);
  });
});

module.exports = router;
