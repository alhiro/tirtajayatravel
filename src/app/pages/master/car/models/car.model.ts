export class CarModel {
  car_id!: number;
  number_plat!: string;
  car_number!: string;
  name!: string;
  photo!: string;
  createdAt!: Date;
  updatedAt!: Date;

  setCar(_category: unknown) {
    const car = _category as CarModel;
    this.car_id = car.car_id;
    this.number_plat = car.number_plat || '';
    this.car_number = car.car_number || '';
    this.name = car.name || '';
    this.photo = car.photo || '';
    this.createdAt = car.createdAt;
    this.updatedAt = car.updatedAt;
  }
}
