const express = require('express');
require('./src/dbs/mongoose');
const loginRouter = require('./src/routers/login');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PATCH, GET, POST, DELETE");
    next();
  });
app.use('/v1/', loginRouter);

app.listen(port, () => {
    console.log('Express listening on port ' + port);
});