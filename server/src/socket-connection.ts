import * as socketIO from 'socket.io';
import * as http from 'http';
import state from './state';

export class SocketConnection {

    io: SocketIO.Server;
    sockets: any = {};

    constructor(private server: http.Server) {
        this.io = socketIO(server);
    }

    init() {
        this.io.on('connection', (socket) => {
            socket.on('hello', (data: any) => {
                let user = data.user;
                this.sockets[user] = socket;
            });
        });
    }

    registerEvent(event: string, callback: Function) {
        this.io.on('connection', socket => {
            socket.on(event, (data: any) => {
                callback(socket, data);
            });
        });
    }

    emit(user: string, event: string, data: any) {
        if (!(user in this.sockets)) {
            return;
        }
        let socket = this.sockets[user];
        socket.emit(event, data);
    }

    broadcast(event: string, data: any, nsp = '/') {
        this.io.of(nsp).emit(event, data);
    }
}