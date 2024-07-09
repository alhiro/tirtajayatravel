export class EmployeeyModel {
  employee_id!: number;
  car_id!: number;
  city_id!: number;
  level_id!: number;
  nik!: string;
  name!: string;
  telp!: string;
  photo!: string;
  active!: string;
  log!: string;

  setEmployee(_category: unknown) {
    const employee = _category as EmployeeyModel;
    this.employee_id = employee.employee_id;
    this.car_id = employee.car_id;
    this.city_id = employee.city_id;
    this.level_id = employee.level_id;
    this.nik = employee.nik;
    this.name = employee.name;
    this.telp = employee.telp;
    this.photo = employee.photo;
    this.active = employee.active;
    this.log = employee.log;
  }
}
