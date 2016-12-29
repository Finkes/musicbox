let lame = require('lame');
let Speaker = require('speaker');
import * as fs from 'fs';

export class Player {

    speaker: any;
    decoder: any;
    stream: any;
    isPlaying = false;
    isPaused = false;
    onEndCallback: Function;

    constructor() { }

    play(filepath: string) {
        this.stop();
        this.isPlaying = true;
        this.isPaused = false;
        this.decoder = new lame.Decoder();
        this.decoder.on('format', (format: any) => {
            this.speaker = this.decoder.pipe(new Speaker(format));
            this.speaker.on('error', (error:any) => {
                console.log(error);
            });
            this.decoder.on("end", () => {
                this.stop();
                if(this.onEndCallback){
                    this.onEndCallback();
                }
            });
        });
        this.stream = fs.createReadStream(filepath);
        this.stream.pipe(this.decoder);
    }

    pause() {
        if (this.isPaused) {
            this.decoder.unpipe();
            this.isPaused = false;
        }
    }

    resume() {
        if (!this.isPaused) {
            this.decoder.pipe(this.speaker);
            this.isPaused = true;
        }
    }

    stop() {
        if (this.isPlaying) {
            this.stream.unpipe();
            this.decoder.unpipe();
            this.isPlaying = false;
        }
    }

    onEnd(callback: Function) {
        this.onEndCallback = callback;
    }
}