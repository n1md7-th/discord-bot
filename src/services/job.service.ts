export class Job {
  private readonly id: Timer;

  constructor(runAt: number, job: () => Promise<void>) {
    this.id = setTimeout(job, runAt);
  }

  cancel() {
    clearTimeout(this.id);
  }
}
