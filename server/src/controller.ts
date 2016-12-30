import state from './state';
import { PlaymusicService } from './service';
import { Player } from './player';
import * as express from 'express';
import logger from './logger';
import { SocketConnection } from './socket-connection';


export class Controller {

    private playmusicService = new PlaymusicService();
    private player = new Player();

    constructor(private socketConnection: SocketConnection) {
        this.player.onEnd(() => {
            this.checkPlayer();
        });
    }

    init() {
        this.playmusicService.init().then(() => {
            logger.log("init playmusic service ok");
        }).catch(error => {
            logger.error(error);
            process.exit(1);
        })
    }


    private sortVoteList() {
        state.votelist = state.votelist.sort((a: any, b: any) => {
            if (a.votes == b.votes) return 0;
            if (a.votes > b.votes) return -1;
            return 1;
        });
    }

    vote(nid: string, user: string, vote: number) {
        return new Promise((resolve, reject) => {
            if (nid == null || user == null) {
                reject();
                return;
            }
            if (!(user in state.uservotes)) {
                state.uservotes[user] = {};
            }
            if (!(nid in state.uservotes[user])) {
                state.uservotes[user][nid] = vote;
                state.votemap[nid].votes += vote;
            }
            else if (state.uservotes[user][nid] !== vote) {
                state.votemap[nid].votes -= state.uservotes[user][nid];
                state.votemap[nid].votes += vote;
                state.uservotes[user][nid] = vote;
            }
            this.sortVoteList();
            resolve(state.uservotes[user]);
        });
    }

    getVotesOfUser(user: string) {
        return new Promise((resolve, reject) => {
            if (user in state.uservotes) {
                resolve(state.uservotes[user]);
            }
            else {
                resolve({});
            }
        });
    }

    addSong(songModel: any) {
        return new Promise((resolve, reject) => {
            this.playmusicService.downloadTrack(songModel.nid)
                .then(() => {
                    songModel.votes = 0;
                    state.votelist.push(songModel);
                    this.sortVoteList();
                    state.votemap[songModel.nid] = songModel;
                    this.checkPlayer();
                    resolve();
                }).catch(error => {
                    reject(error);
                });
        });
    }

    checkPlayer() {
        if (!this.player.isPlaying) {
            if (state.votelist.length === 0) {
                return;
            }
            let nextSong = state.votelist.shift();
            nextSong.played = new Date();
            state.playlist.unshift(nextSong);
            this.socketConnection.broadcast('votelist', state.votelist);
            this.socketConnection.broadcast('playlist', state.playlist);
            this.player.play(__dirname + `/../songs/${nextSong.nid}.mp3`);
        }
    }

    handleRestart() {
        if (state.playlist.length === 0) {
            return;
        }
        let lastSong = state.playlist[0];
        this.player.play(__dirname + `/../songs/${lastSong.nid}.mp3`);
    }


    searchSong(query: string) {
        return new Promise((resolve, reject) => {
            this.playmusicService.searchSongs(query).then(songs => {
                resolve(songs);
            }).catch(error => {
                reject(error);
            })
        });
    }
}