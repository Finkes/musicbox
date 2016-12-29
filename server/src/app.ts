
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import { Api } from './api';
import { SocketConnection } from './socket-connection';
import logger from './logger'
import state from './state';


let app = express();
let server = http.createServer(app);
let socketConnection = new SocketConnection(server);
let api = new Api(socketConnection);
app.use(bodyParser.json());

app.use('/api', api.getRouter());
app.use('/covers', express.static(__dirname + '/../covers'));
app.use('/static', express.static(__dirname + '/../../client/static'));
app.use('/', express.static(__dirname + '/../../client/dist'));
app.use('/search', express.static(__dirname + '/../../client/dist/index.html'));
app.use('/playlist', express.static(__dirname + '/../../client/dist/index.html'));

let port = process.env.port || 4000;

server.listen(port, () => {
    logger.info("starting on port " + port);
    api.init();
    socketConnection.init();
    
    // reload state
    state.load().then(() => {
        api.getController().handleRestart();
    }).catch(error => {
        logger.info('could not load previous session');
    });
});

// save state periodically
setInterval(() => {
    logger.info('saving state');
    state.save();
}, 1 * 60 * 1000);