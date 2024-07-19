export class SenderModel {
  sender_id!: number;
  customer_id!: number;
  package_id!: number;
  date!: Date;
  time: any;

  setRecipient(_senders: unknown) {
    const packages = _senders as SenderModel;
    this.sender_id = packages.sender_id;
    this.customer_id = packages.customer_id;
    this.package_id = packages.package_id;
    this.date = packages.date;
    this.time = packages.time;
  }
}
