const generateRouter = require('./generate')

const mountRoutes = (app) => {
  app.use(generateRouter);
}

module.exports = mountRoutes