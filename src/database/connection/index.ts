import config from 'config';
import mongoose from 'mongoose';
import express from 'express'
const dbUrl: any = config.get('db_url');
console.log(dbUrl);
const mongooseConnection = express()
mongoose.set('strictQuery', true);
mongoose.connect(
    dbUrl,
).then(() => console.log('Database successfully connected')).catch(err => console.log(err));
export { mongooseConnection }