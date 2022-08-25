const app = require('./app')
const PORT = 7098;


app.listen(PORT, () => {
  console.log(`UUID microservice listening on port ${PORT}`);
});
