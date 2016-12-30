let lame = require('lame');
let Speaker = require('speaker');
import * as fs from 'fs';
import logger from './logger';

export class Player {

    speaker: any;
    decoder: any;
    stream: any;
    isPlaying = false;
    isPaused = false;
    onEndCallback: Function;
    private manualStop = false;

    constructor() {

    }

    play(filepath: string): boolean {
        if (this.isPlaying) {
            return false;
        }
        this.isPlaying = true;
        this.isPaused = false;
        this.stream = fs.createReadStream(filepath);
        this.decoder = this.stream.pipe(new lame.Decoder());
        this.speaker = this.decoder.pipe(new Speaker());
        this.speaker.on('error', (error: any) => {
            logger.error(error);
        });
        this.speaker.on('close', () => {
            if(this.manualStop){
                this.manualStop = false;
                return;
            }
            logger.info("song ended / speaker close");
            this.stream.unpipe();
            this.decoder.unpipe();
            this.isPlaying = false;
            if (this.onEndCallback) {
                this.onEndCallback();
            }
        });
        this.decoder.on("end", () => {
            logger.info("decoder end");
        });
        return true;
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
        this.manualStop = true;
        return new Promise((resolve, reject) => {
            if (!this.isPlaying) {
                resolve();
                return;
            }
            this.speaker.on('close', () => {
                this.isPlaying = false;
                resolve();
            });
            this.stream.unpipe();
            this.decoder.unpipe();
            this.speaker.close();
        });
    }

    onEnd(callback: Function) {
        this.onEndCallback = callback;
    }
}

