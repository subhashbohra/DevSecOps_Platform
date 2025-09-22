const express = require('express');
const multer = require('multer');
const path = require('path');

const upload = multer({ dest: 'uploads/' }); // VULN: no file-type checks, no size limits
const router = express.Router();

router.post('/image', upload.single('image'), (req, res) => {
  // VULN: saving original filename may allow directory traversal in some setups
  const original = req.file.originalname;
  // insecure rename simulation
  const fs = require('fs');
  const dest = path.join('uploads', original);
  fs.renameSync(req.file.path, dest);
  res.send('Uploaded');
});

module.exports = router;
