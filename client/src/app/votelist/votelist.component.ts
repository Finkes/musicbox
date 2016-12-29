import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Song } from '../../models/song';

@Component({
  selector: 'votelist',
  templateUrl: './votelist.component.html',
  styleUrls: ['./votelist.component.css']
})
export class VotelistComponent implements OnInit {

  private songs: Song[] = [];

  private userVotes = {};

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.apiService.getVotelist().subscribe(songs => {
      this.songs = songs;
    });
    this.apiService.getVotes().subscribe(votes => {
      this.userVotes = votes;
      console.log(this.userVotes);
    });
  }

  vote(song: any, value: number) {
    console.log(value);
    let vote = value;
    if (song.nid in this.userVotes) {
      if (this.userVotes[song.nid] === value) {
        vote = 0;
      }
      song.votes -= this.userVotes[song.nid];
    }
    this.userVotes[song.nid] = vote;
    song.votes += vote;
    this.apiService.vote(song.nid, vote).subscribe(votes => {
      this.userVotes = votes;
      this.songs = this.songs.sort((a, b) => {
        if(a.votes == b.votes) return 0;
        if(a.votes > b.votes) return -1;
        return 1;
      });
    });
  }

}
