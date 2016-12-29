import * as fs from 'fs';
import logger from './logger'

class State {
    votelist: any[] = [];
    playlist: any[] = [];
    votemap: any = {};
    uservotes: any = {};

    save() {
        return new Promise((resolve, reject) => {
            let data = { votelist: this.votelist, playlist: this.playlist, uservotes: this.uservotes };
            fs.writeFile(__dirname + '/../state.json', JSON.stringify(data, null, 4), (err) => {
                if (!err) {
                    resolve();
                    return;
                }
                logger.error(err);
                reject(err);
            });
        });
    }

    load() {
        return new Promise((resolve, reject) => {
            try {
                let data = fs.readFileSync(__dirname + '/../state.json').toString();
                let json = <any>JSON.parse(data);
                this.votelist = json.votelist;
                this.uservotes = json.uservotes;
                this.playlist = json.playlist;
                this.votelist.map(song => {
                    this.votemap[song.nid] = song;
                });
                resolve();
            }
            catch (error) {
                reject(error);
            }
        });
    }
}

export default new State();