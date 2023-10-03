'use strict';

require('dotenv').config()

const express = require('express');
const connectDb = require('./config/db');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const { extractKnBase } = require('./middlewares/extractKnBase');

const FRONTEND_HOST = process.env.FRONTEND_HOST ?? 'localhost'
const FRONTEND_PORT = process.env.FRONTEND_PORT ?? '5173'
const FRONTEND_PROTOCOL = process.env.FRONTEND_PROTOCOL ?? 'http'

const corsOptions = {
  exposedHeaders: 'Authorization',
  credentials: true,
  origin: `${FRONTEND_PROTOCOL}://${FRONTEND_HOST}` + ((FRONTEND_PORT != 80 && FRONTEND_PORT != 443) ? `:${FRONTEND_PORT}` : ``)
};
 
// Constants
const PORT = process.env.API_PORT ?? '8080';
const HOST = process.env.API_HOST ?? '0.0.0.0';

connectDb();
 
// App
const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
require('./middlewares/passport');
app.use(extractKnBase);

app.get('/', (req, res) => {
  res.send('kn base ready');
});

app.use('/', require('./routes/knPieceRoutes'));
app.use('/kb/', require('./routes/knBaseRoutes'));
app.use('/user/', require('./routes/userRoutes'));

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});