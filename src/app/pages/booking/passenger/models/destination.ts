export class DestinationModel {
  destination_id!: number;
  customer_id!: number;
  passenger_id!: number;
  date!: Date;
  time: any;

  setWaybill(_destination: unknown) {
    const destination = _destination as DestinationModel;
    this.destination_id = destination.destination_id;
    this.customer_id = destination.customer_id;
    this.passenger_id = destination.passenger_id;
    this.date = destination.date;
    this.time = destination.time;
  }
}
