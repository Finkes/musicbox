import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { VotelistComponent } from './votelist/votelist.component';
import { SongItemComponent } from './song-item/song-item.component';
import { SongSearchComponent } from './song-search/song-search.component';

import { ApiService } from './api.service';
import { PlaylistComponent } from './playlist/playlist.component';
import { SpinnerComponent } from './spinner/spinner.component';

const appRoutes: Routes = [
  { path: 'search', component: SongSearchComponent },
  { path: 'playlist', component: PlaylistComponent },
  { path: '**', component: VotelistComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    VotelistComponent,
    SongItemComponent,
    SongSearchComponent,
    PlaylistComponent,
    SpinnerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
