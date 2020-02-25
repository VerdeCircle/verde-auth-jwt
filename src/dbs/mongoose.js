const mongoose = require('mongoose');

const DB_MAX_RETRIES = process.env.DB_MAX_RETRIES || 10;
const DB_RETRY_MILLISECONDS = process.env.DB_RETRY_MILLISECONDS || 5000;

try {
  const retrycounter = () => {
    let counted = 0;
    count = () => counted;
    increment = () => counted++;
    return { count, increment };
  };
  let mongooseretries = retrycounter();

  // Keep retrying a DB connection until the DB_MAX_RETRIES is exhausted
  const ConnectionBadger = async () => {
    return mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false
    }).then(() => {
      if (mongooseretries.count() > 0) console.log(`We don't need no stinking Badgers!`);
    }).catch(error => {
      mongooseretries.increment();
      if (mongooseretries.count() > DB_MAX_RETRIES) throw new Error('DB CONNECT RETRIES EXCEEDED');
      setTimeout(ConnectionBadger, DB_RETRY_MILLISECONDS);
    });
  };

  mongoose.connection.on('connected', () => {
    console.log('Mongo like Candy');
  });

  mongoose.connection.on('error', (err) => {
    console.log(`Candygram for Mongo: ${mongooseretries.count() - 1}`);
  });

  ConnectionBadger();
} catch (e) {
  console.log('Mongo only pawn in game of life');
}


