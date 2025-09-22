const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET = 'my_very_weak_secret'; // VULN: hardcoded secret

router.post('/login', (req, res) => {
  const user = req.body.user || 'guest';
  // VULN: issuing token with no expiry and weak secret
  const token = jwt.sign({ user }, SECRET, { algorithm: 'HS256' });
  res.json({ token });
});

router.get('/verify', (req, res) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET); // VULN: hardcoded secret
    res.json({ ok: true, payload });
  } catch (e) {
    res.status(401).json({ ok: false });
  }
});

module.exports = router;
