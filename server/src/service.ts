import * as Playmusic from "playmusic";
import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import { PromiseQueue } from './PromiseQueue';
import logger from './logger';


export class PlaymusicService {
    pm: any;
    public init() {
        return new Promise((resolve, reject) => {
            this.pm = new Playmusic();
            this.pm.init({
                androidId: process.env.android_id,
                masterToken: process.env.master_token
            }, (err: any) => {
                if (err) {
                    logger.error(err);
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    searchSongs(query: string, maxResults = 10) {
        return new Promise((resolve, reject) => {
            try {
                this.pm.search(query, maxResults, (error: any, data: any) => {
                    if (error) {
                        logger.error(error);
                        reject(error);
                        return;
                    }
                    if (!('entries' in data)) {
                        logger.info('no entries found for: ' + query);
                        resolve([]);
                        return;
                    }
                    let sorted = data.entries.sort((a: any, b: any) => {
                        return a.score < b.score;
                    });
                    let filtered = sorted.filter((song: any) => {
                        return song.type == "1" && song.track.nid;
                    });
                    let mapped = filtered.map((song: any) => {
                        return song.track;
                    });
                    let args: any = [];
                    mapped.map((song: any) => {
                        args.push(song);
                    });
                    let promiseQueue = new PromiseQueue((song: any) => {
                        return this.downloadCover(song);
                    }, args, 1, false);
                    promiseQueue.run().then(() => {
                        resolve(mapped);
                    }).catch(error => {
                        logger.error(error);
                        reject(error);
                    })
                });
            }
            catch (error) {
                logger.error(error);
                reject();
            }
        });
    }

    public getPlaylists() {
        return new Promise((resolve, reject) => {
            this.pm.getPlayLists((err: any, data: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data.data.items);
            });
        });
    }

    public downloadCover(song: any) {
        return new Promise((resolve, reject) => {
            let coverUrl = song.albumArtRef.length > 0 ? song.albumArtRef[0].url : 'unknown';

            if (fs.existsSync(__dirname + `/../covers/${song.albumId}.jpg`) || coverUrl === 'unknown') {
                resolve();
                return;
            }

            let urlData = url.parse(coverUrl);

            let options = {
                host: urlData.host,
                path: urlData.path
            };

            let callback = (response: any) => {
                response.on('data', (chunk: any) => {
                    fs.appendFileSync(__dirname + `/../covers/${song.albumId}.jpg`, chunk);
                });

                response.on('end', function () {
                    resolve();
                });
            }
            let request = http.request(options, callback);
            request.on('error', error => {
                logger.error(error);
                reject();
            });
            request.end();
        })
    }

    public downloadTrack(nid: string) {
        return new Promise((resolve, reject) => {
            let exists = fs.existsSync(__dirname + `/../songs/${nid}.mp3`);
            if (exists) {
                logger.info("song already downloaded (" + nid + ")");
                resolve();
                return;
            }
            logger.info("downloading (" + nid + ")");
            this.pm.getStreamUrl(nid, (err: any, streamUrl: any) => {
                if (err) {
                    logger.error(err);
                    return;
                }

                let urlData = url.parse(streamUrl);
                let options = {
                    host: urlData.host,
                    path: urlData.path
                };

                let callback = (response: any) => {
                    let data: any = [];
                    response.on('data', (chunk: any) => {
                        data.push(chunk);
                    });

                    response.on('end', () => {
                        logger.info("download done");
                        let totalLength = 0;
                        data.map((buf: any) => {
                            totalLength += buf.length;
                        });
                        let fullStream = Buffer.concat(data, totalLength);

                        fs.writeFile(__dirname + `/../songs/${nid}.mp3`, fullStream, () => {
                            resolve();
                        });
                    });
                }
                let request = http.request(options, callback);
                request.on('error', error => {
                    logger.error(error);
                    reject();
                })
                request.end();
            });
        });

    }

    public getAllPlaylistTracks() {
        return new Promise((resolve, reject) => {
            this.pm.getPlayListEntries((err: any, data: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                let tracks = data.data.items;
                let map: any = {};
                tracks.forEach((track: any) => {
                    if (!(track.playlistId in map)) {
                        map[track.playlistId] = [];
                    }
                    map[track.playlistId].push(track);
                });
                resolve(map);
            });
        });
    }
}