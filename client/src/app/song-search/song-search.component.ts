import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Song } from '../../models/song';

@Component({
  selector: 'song-search',
  templateUrl: './song-search.component.html',
  styleUrls: ['./song-search.component.css']
})
export class SongSearchComponent implements OnInit {

  results: Song[] = [];
  query: string;
  loaded = false;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
  }

  addSong(song: Song) {
    song.added = true;
    this.apiService.addSong(song).subscribe(res => {
    });
  }

  onSubmit(event: KeyboardEvent) {
    if (event.keyCode !== 13) {
      return;
    }
    this.loaded = false;
    this.apiService.searchSongs(this.query).subscribe(songs => {
      this.results = songs;
      this.loaded = true;
    });
  }

}
