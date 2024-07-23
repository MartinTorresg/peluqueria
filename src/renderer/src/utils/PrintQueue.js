// src/utils/PrintQueue.js

export class PrintQueue {
  constructor() {
    this.queue = [];
    this.isPrinting = false;
  }

  enqueue(job) {
    this.queue.push(job);
    this.processQueue();
  }

  async processQueue() {
    if (this.isPrinting || this.queue.length === 0) return;

    this.isPrinting = true;
    const job = this.queue.shift();

    try {
      await window.posPrinter.print({ data: job.data, options: job.options });
      console.log('Impresión exitosa');
    } catch (error) {
      console.error('Error en la impresión:', error);
    } finally {
      this.isPrinting = false;
      this.processQueue();
    }
  }
}
