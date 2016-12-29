export class PromiseQueue {

    private results: any[];
    private availableWorkers: number;
    private maxParallelWorkers: number
    private errorOccurred = false;
    private resolve: Function;
    private reject: Function;

    constructor(private job: (arg:any) => Promise<any>, private jobArgs: any[], private parallelJobs: number, private stopOnError = true) {
        this.job = job;
        this.jobArgs = jobArgs;
        this.availableWorkers = parallelJobs;
        this.maxParallelWorkers = parallelJobs;
        this.errorOccurred = false;
        this.stopOnError = stopOnError;
        this.results = [];
    }

    run() {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            this._scheduleJobs();
        });
    }

    _scheduleJobs() {
        if (this.jobArgs.length === 0 && this.availableWorkers === this.maxParallelWorkers) {
            this.resolve(this.results);
            return;
        }
        while (this.jobArgs.length > 0 && this.availableWorkers > 0) {
            let arg = this.jobArgs.shift();
            this.availableWorkers--;
            this.job(arg).then((result: any) => {
                this.results.push(result);
                this.availableWorkers++;
                if (this.errorOccurred && this.stopOnError) {
                    return;
                }
                this._scheduleJobs();
            }).catch((error: any) => {
                this.availableWorkers++;
                if (!this.errorOccurred && this.stopOnError) {
                    this.reject(error);
                    this.errorOccurred = true;
                }
                else if (!this.stopOnError) {
                    this.results.push(error);
                    this._scheduleJobs();
                }
            });
        }
    }
}
