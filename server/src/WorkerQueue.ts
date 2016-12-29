export class WorkerQueue {

    jobs: any = [];
    deferreds: Deferred[] = [];
    runningJobs = 0;


    queueJob(job: Function) {
        this.jobs.push(job);
        let deferred = new Deferred();
        this.deferreds.push(deferred);
        this.checkJobs();
        return deferred;
    }

    private checkJobs() {
        if (this.runningJobs === 0 && this.jobs.length > 0) {
            let nextJob = this.jobs.shift();
            this.runningJobs++;
            nextJob().then((result = {}) => {
                this.runningJobs--;
                let deferred = this.deferreds.shift();
                deferred.resolve(result);
                this.checkJobs();
            });
        }
    }
}

export class Deferred {
    resolve: Function;
    reject: Function;
    promise: Promise<any>;

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}