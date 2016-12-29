import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Song } from '../models/song';
import { Observable, Observer } from 'rxjs';
import * as io from 'socket.io-client';

import 'rxjs/add/operator/map';

@Injectable()
export class ApiService {

  username: string;
  private socket: SocketIOClient.Socket;

  constructor(private http: Http) {
    if (typeof (Storage) !== "undefined") {
      this.username = localStorage.getItem('username') || this.createId();
      localStorage.setItem("username", this.username);
      console.log(this.username);
    } else {
      alert("local storage not supported!");
      this.username = this.createId();
    }
    this.socket = io('/', {});
    this.init();
  }

  getUsername() {
    return this.username;
  }

  createId() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 20);
  }

  votelistObservable: Observable<Song[]>;
  playlistObservable: Observable<Song[]>;

  init() {
    this.votelistObservable = new Observable((observer: Observer<Song[]>) => {
      this.socket.on('votelist', (data: any) => {
        observer.next(data);
      });
    });
    this.playlistObservable = new Observable((observer: Observer<Song[]>) => {
      this.socket.on('playlist', (data: any) => {
        observer.next(data);
      });
    });
  }


  // http / REST API

  searchSongs(query: string): Observable<Song[]> {
    return this.http.get(`/api/search?query=${query}`, {}).map((res: any) => {
      let data = res.json().data.songs;
      console.log(data);
      return data;
    });
  }

  addSong(song: Song): Observable<Song> {
    return this.http.post(`/api/votelist`, song, {}).map(res => res.json().data);
  }



  getVotelist(): Observable<Song[]> {
    this.socket.emit('votelist', {});
    return this.votelistObservable;
    //return this.http.get(`/api/votelist`, {}).map(res => res.json().data);
  }

  getPlaylist(): Observable<Song[]> {
    this.socket.emit('playlist', {});
    return this.playlistObservable;
    // return this.http.get(`/api/playlist`, {}).map(res => res.json().data);
  }

  getVotes(): Observable<any> {
    return this.http.get(`/api/users/${this.username}/votes`, {}).map(res => res.json().data.votes);
  }

  vote(nid: string, vote: number): Observable<any> {
    return this.http.put(`/api/users/${this.username}/votes/${nid}`, { vote: vote }, {}).map(res => res.json().data.votes);
  }
}
