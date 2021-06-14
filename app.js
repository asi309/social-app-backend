const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const routes = require('./routes');

const app = express();

const PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// redisClient.on('connect', () => {
//   console.log('Redis server connected');
// });

try {
  mongoose.connect(process.env.MONGO_DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  console.log('DB Connected Successfully!');
} catch (error) {
  console.log(error);
}

app.use(cors({ origin: '*' }));
// app.use(cookieParser());
app.use(express.json());
app.use(routes);

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});

module.exports = app;
