"use strict"
import express, { Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import http from 'http';
import { mongooseConnection } from './database'
import * as packageInfo from '../package.json'
import { socketServer } from './helper';
import config from 'config'
import cors from 'cors'

import { router } from './routes'

const app = express();
const corsOption = {
    origin: "*",
};
app.use(cors())
app.use(bodyParser.json({ limit: '200mb' }))
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }))
// console.log(process.env.NODE_ENV);
const health = (req, res) => {
    return res.status(200).json({
        message: `Demo Server is Running, Server health is green`,
        app: packageInfo.name,
        version: packageInfo.version,
        description: packageInfo.description,
        author: packageInfo.author,
        license: packageInfo.license
    })
}
const bad_gateway = (req, res) => { return res.status(502).json({ status: 502, message: "Demo Backend API Bad Gateway" }) }

app.get('/', health);
app.get('/health', health);
app.use(mongooseConnection)
app.get('/isServerUp', (req, res) => {
    res.send('Server is running ');
});
// app.use(router)
app.use('*', bad_gateway);


// let server = new http.Server(app);
// export default server;
export default socketServer(app);
