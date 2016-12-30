import * as express from 'express';
import state from './state';
import { Controller } from './controller';
import { SocketConnection } from './socket-connection';


export class Api {

    private controller: Controller;

    constructor(private socketConnection: SocketConnection) {
        this.controller = new Controller(socketConnection);
    }

    init() {
        this.controller.init();
        this.registerSocketEvents();
    }

    registerSocketEvents() {
        this.socketConnection.registerEvent('votelist', (socket: SocketIO.Socket, data: any) => {
            socket.emit('votelist', state.votelist);
        });
        this.socketConnection.registerEvent('playlist', (socket: SocketIO.Socket, data: any) => {
            socket.emit('playlist', state.playlist);
        });
    }

    getController() {
        return this.controller;
    }

    getRouter() {
        let router = express.Router();
        router.get('/save', (req, res) => this.saveState(req, res));
        router.get('/player/next', (req, res) => this.playNextSong(req, res));
        router.get('/search', (req, res) => this.searchSong(req, res));
        router.get('/playlist', (req, res) => this.success(res, state.playlist));
        router.get('/votelist', (req, res) => this.success(res, state.votelist));
        router.post('/votelist', (req, res) => this.addSong(req, res));
        router.put('/users/:user/votes/:nid', (req, res) => this.vote(req, res));
        router.get('/users/:user/votes', (req, res) => this.getVotesOfUser(req, res));
        return router;
    }

    saveState(req: express.Request, res: express.Response) {
        state.save().then(() => {
            this.success(res);
        });
    }

    playNextSong(req: express.Request, res: express.Response) {
        this.controller.playNextSong().then(() => {
            this.success(res);
        });
    }

    addSong(req: express.Request, res: express.Response) {
        let songModel = req.body;
        this.controller.addSong(songModel).then(() => {
            this.success(res);
            this.socketConnection.broadcast('votelist', state.votelist);
        }).catch(error => {
            this.fail(res);
        });
    }

    vote(req: express.Request, res: express.Response) {
        let nid = req.params.nid;
        let user = req.params.user;
        let vote = req.body.vote;
        this.controller.vote(nid, user, vote).then(votes => {
            this.success(res, { votes });
            this.socketConnection.broadcast('votelist', state.votelist);
        }).catch(error => {
            this.fail(res);
        });
    }


    getVotesOfUser(req: express.Request, res: express.Response) {
        let user = req.params.user;
        this.controller.getVotesOfUser(user).then(votes => {
            this.success(res, { votes });
        }).catch(error => {
            this.fail(res);
        });
    }


    searchSong(req: express.Request, res: express.Response) {
        let query = req.query.query;
        this.controller.searchSong(query).then(songs => {
            this.success(res, { songs });
        }).catch(error => {
            this.fail(res);
        });
    }

    success(res: express.Response, data = {}, status = 200) {
        res.status(status).send({ success: true, data });
    }

    fail(res: express.Response, statusCode = 500, error: any = {}) {
        res.status(statusCode).send({ success: false, error });
    }
}