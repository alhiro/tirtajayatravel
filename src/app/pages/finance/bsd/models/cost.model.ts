export class CostModel {
  cost_id!: number;
  car_id!: number;
  go_send_id!: number;
  parking_package!: number;
  parking_passenger!: number;
  bbm!: number;
  bbm_cost!: number;
  toll_in!: number;
  toll_out!: number;
  overnight!: number;
  extra!: number;
  others!: number;
  mandatory_deposit!: number;
  driver_deposit!: number;
  voluntary_deposit!: number;
  current_km!: number;
  old_km!: number;

  setCost(_costs: unknown) {
    const costs = _costs as CostModel;
    this.cost_id = costs.cost_id;
    this.car_id = costs.car_id;
    this.go_send_id = costs.go_send_id;
    this.parking_package = costs.parking_package;
    this.parking_passenger = costs.parking_passenger;
    this.bbm = costs.bbm;
    this.bbm_cost = costs.bbm_cost;
    this.toll_in = costs.toll_in;
    this.toll_out = costs.toll_out;
    this.overnight = costs.overnight;
    this.extra = costs.extra;
    this.others = costs.others;
    this.mandatory_deposit = costs.mandatory_deposit;
    this.driver_deposit = costs.driver_deposit;
    this.voluntary_deposit = costs.voluntary_deposit;
    this.current_km = costs.current_km;
    this.old_km = costs.old_km;
  }
}
