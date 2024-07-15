export class RecipientModel {
  recipient_id!: number;
  customer_id!: number;
  package_id!: number;
  date!: Date;
  time: any;
  sign!: string;
  received_by!: string;
  user_payment!: string;
  date_payment!: Date;

  setRecipient(_reicipients: unknown) {
    const packages = _reicipients as RecipientModel;
    this.recipient_id = packages.recipient_id;
    this.customer_id = packages.customer_id;
    this.package_id = packages.package_id;
    this.date = packages.date;
    this.time = packages.time;
    this.sign = packages.sign || '';
    this.received_by = packages.received_by || '';
    this.user_payment = packages.user_payment || '';
    this.date_payment = packages.date_payment;
  }
}
