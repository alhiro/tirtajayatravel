export class SenderModel {
  recipient_id!: number;
  customer_id!: number;
  package_id!: number;
  date!: Date;
  time: any;

  setRecipient(_senders: unknown) {
    const packages = _senders as SenderModel;
    this.recipient_id = packages.recipient_id;
    this.customer_id = packages.customer_id;
    this.package_id = packages.package_id;
    this.date = packages.date;
    this.time = packages.time;
  }
}
