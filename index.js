const express = require('express');
const bodyParser = require('body-parser');
const sqlRoutes = require('./routes/sql');
const execRoutes = require('./routes/exec');
const fileRoutes = require('./routes/fileupload');
const authRoutes = require('./routes/auth');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/sql', sqlRoutes);
app.use('/exec', execRoutes);
app.use('/upload', fileRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => res.send('Vuln Testbed Running'));
app.listen(3000, () => console.log('Listening on 3000'));
