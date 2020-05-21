const express = require('express');

const app = express();

app.use((request, response, next) => {
  console.log('first middleware')
  next();
})

app.use((request, response, next) => {
  response.send('expresssdsd')
})

module.exports = app;
