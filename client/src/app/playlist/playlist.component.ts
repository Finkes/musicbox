import { Component, OnInit } from '@angular/core';
import {ApiService } from '../api.service';
import { Song } from '../../models/song';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit {

  private songs: Song[] = [];


  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.apiService.getPlaylist().subscribe(songs => {
      this.songs = songs;
    });
  }

}
