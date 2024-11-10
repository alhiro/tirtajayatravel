import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { PassengerModel } from '../models/passenger.model';
import { Subject, finalize, takeUntil } from 'rxjs';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { PassengerService } from '../passenger.service';

interface GroupedData {
  date: string;
  item: {
    id: number;
    cost: number;
  }[];
}
@Component({
  selector: 'app-printList',
  templateUrl: './printList.component.html',
  styleUrls: ['./printList.component.scss'],
})
export class PrintListPassengerComponent implements OnInit, OnDestroy {
  public data: any;
  public city: any;
  public groupAdmin: any;

  public startDate: any;
  public endDate: any;
  public nowDate!: Date;
  public startDateDisplay: any;
  public endDateDisplay: any;

  public totalCost: any = 0;
  public totalPassenger: any = 0;

  public configuration: Config = { ...DefaultConfig };
  public columns!: Columns[];

  public pagination = {
    limit: 5,
    offset: 1,
    count: -1,
    search: '',
    startDate: '',
    endDate: '',
  };

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private passengerService: PassengerService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.configuration.resizeColumn = false;
    this.configuration.fixedColumnWidth = true;
    this.configuration.paginationEnabled = false;
    this.configuration.orderEnabled = false;

    this.columns = [
      // { key: 'category_sub_id', title: 'No' },
      { key: 'resi_number', title: 'Booking Code' },
      { key: 'created_by', title: 'Booker' },
      { key: 'resi_number_new', title: 'Move To' },
      { key: 'resi_number_old', title: 'Move From' },
      { key: 'tariff', title: 'Tariff' },
      { key: 'status', title: 'Status' },
      { key: 'description', title: 'Description' },
      { key: 'payment', title: 'Status Payment' },
      { key: 'name', title: 'Passenger' },
      { key: 'total_passenger', title: 'Total' },
      { key: 'telp', title: 'Telp.' },
      { key: 'waybill_id', title: 'Pickup Address' },
      { key: 'destination_id', title: 'Delivery Address' },
    ];

    this.nowDate = new Date();
    // this.getPrint();

    const getCity: any = sessionStorage.getItem('city');
    const objDataCity = JSON.parse(getCity);
    const getDataDate: any = sessionStorage.getItem('printlistdate');
    const objDataDate = JSON.parse(getDataDate);

    this.city = objDataCity;
    this.startDate = objDataDate.fromDate;
    this.startDateDisplay = this.startDate?.split(' ')[0];
    this.endDate = objDataDate.toDate;
    this.endDateDisplay = this.endDate?.split(' ')[0];

    const params = {
      limit: '',
      page: '',
      search: '',
      startDate: this.startDate,
      endDate: this.endDate,
    };
    this.dataListFilter(params);
  }

  private dataListFilter(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.passengerService
      .listAll(params)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        finalize(() => {
          this.configuration.isLoading = false;
        })
      )
      .subscribe((response: any) => {
        // count malang or surabaya
        if (response.data.length > 0) {
          this.data = response.data?.filter((data: PassengerModel) => data.city_id === this.city);

          this.totalCost = this.data?.reduce((acc: any, item: any) => acc + Number(item?.tariff), 0);
          this.totalPassenger = this.data?.reduce((acc: any, item: any) => acc + Number(item?.total_passenger), 0);

          const resultGroup = this.data.reduce((acc: any, item: any) => {
            // Find the existing group by date
            const existingGroup = acc.find((group: any) => group.book_date === item.book_date);

            if (existingGroup) {
              // If the group exists, update the totalCost and add the item
              existingGroup.totalCost += item.tariff;
              existingGroup.totalPassenger += item.total_passenger;
              existingGroup.items.push({
                passenger_id: item.passenger_id,
                waybill_id: item.waybill_id,
                waybills: item.waybills,
                waybill: item.waybill,
                destination_id: item.destination_id,
                destinations: item.destinations,
                city_id: item.city_id,
                city: item.city,
                employee_id: item.employee_id,
                go_send_id: item.go_send_id,
                tariff: item.tariff,
                discount: item.discount,
                agent_commission: item.agent_commission,
                other_fee: item.other_fee,
                book_date: item.book_date,
                total_passenger: item.total_passenger,
                payment: item.payment,
                status: item.status,
                status_passenger: item.status_passenger,
                note: item.note,
                description: item.description,
                resi_number: item.resi_number,
                cancel: item.cancel,
                move: item.move,
                position: item.position,
                charter: item.charter,
                check_payment: item.check_payment,
                updatedAt: item.updatedAt,
                updated_by: item.updated_by,
                createdAt: item.createdAt,
                created_by: item.created_by,
              });
            } else {
              // If the group does not exist, create a new one
              acc.push({
                book_date: item.book_date,
                totalCost: item.tariff,
                totalPassenger: item.total_passenger,
                items: [
                  {
                    passenger_id: item.passenger_id,
                    waybill_id: item.waybill_id,
                    waybills: item.waybills,
                    waybill: item.waybill,
                    destination_id: item.destination_id,
                    destinations: item.destinations,
                    city_id: item.city_id,
                    city: item.city,
                    employee_id: item.employee_id,
                    go_send_id: item.go_send_id,
                    tariff: item.tariff,
                    discount: item.discount,
                    agent_commission: item.agent_commission,
                    other_fee: item.other_fee,
                    book_date: item.book_date,
                    total_passenger: item.total_passenger,
                    payment: item.payment,
                    status: item.status,
                    status_passenger: item.status_passenger,
                    note: item.note,
                    description: item.description,
                    resi_number: item.resi_number,
                    cancel: item.cancel,
                    move: item.move,
                    position: item.position,
                    charter: item.charter,
                    check_payment: item.check_payment,
                    updatedAt: item.updatedAt,
                    updated_by: item.updated_by,
                    createdAt: item.createdAt,
                    created_by: item.created_by,
                  },
                ],
              });
            }

            return acc;
          }, []);
          this.groupAdmin = resultGroup;
          console.log(this.groupAdmin);

          this.configuration.isLoading = false;
          this.configuration.horizontalScroll = true;
          this.cdr.detectChanges();
        } else {
          this.configuration.horizontalScroll = false;

          this.data = [];
        }
      });
  }

  // getPrint() {
  //   const getCity: any = sessionStorage.getItem('city');
  //   const objDataCity = JSON.parse(getCity);
  //   const getDataDate: any = sessionStorage.getItem('printlistdate');
  //   const objDataDate = JSON.parse(getDataDate);
  //   const getData: any = sessionStorage.getItem('printlist');
  //   const objData = JSON.parse(getData);
  //   console.log(objData);

  //   this.city = objDataCity;
  //   const dateStart = objDataDate.startDate;
  //   this.startDate = dateStart?.split(' ')[0];
  //   console.log(this.startDate);
  //   const dateEnd = objDataDate.toDate;
  //   this.endDate = dateEnd?.split(' ')[0];
  //   console.log(this.endDate);

  //   this.data = objData;
  //   this.totalCost = this.data?.reduce((acc: any, item: any) => acc + Number(item?.tariff), 0);
  //   this.totalPassenger = this.data?.reduce((acc: any, item: any) => acc + Number(item?.total_passenger), 0);

  //   const resultGroup = this.data.reduce((acc: any, item: any) => {
  //     // Find the existing group by date
  //     const existingGroup = acc.find((group: any) => group.book_date === item.book_date);

  //     if (existingGroup) {
  //       // If the group exists, update the totalCost and add the item
  //       existingGroup.totalCost += item.tariff;
  //       existingGroup.totalPassenger += item.total_passenger;
  //       existingGroup.items.push({
  //         passenger_id: item.passenger_id,
  //         waybill_id: item.waybill_id,
  //         waybills: item.waybills,
  //         destination_id: item.destination_id,
  //         destinations: item.destinations,
  //         city_id: item.city_id,
  //         city: item.city,
  //         employee_id: item.employee_id,
  //         go_send_id: item.go_send_id,
  //         tariff: item.tariff,
  //         discount: item.discount,
  //         agent_commission: item.agent_commission,
  //         other_fee: item.other_fee,
  //         book_date: item.book_date,
  //         total_passenger: item.total_passenger,
  //         payment: item.payment,
  //         status: item.status,
  //         status_passenger: item.status_passenger,
  //         note: item.note,
  //         description: item.description,
  //         resi_number: item.resi_number,
  //         cancel: item.cancel,
  //         move: item.move,
  //         position: item.position,
  //         charter: item.charter,
  //         check_payment: item.check_payment,
  //         updatedAt: item.updatedAt,
  //         updated_by: item.updated_by,
  //         createdAt: item.createdAt,
  //         created_by: item.created_by,
  //       });
  //     } else {
  //       // If the group does not exist, create a new one
  //       acc.push({
  //         book_date: item.book_date,
  //         totalCost: item.tariff,
  //         totalPassenger: item.total_passenger,
  //         items: [
  //           {
  //             passenger_id: item.passenger_id,
  //             waybill_id: item.waybill_id,
  //             waybills: item.waybills,
  //             destination_id: item.destination_id,
  //             destinations: item.destinations,
  //             city_id: item.city_id,
  //             city: item.city,
  //             employee_id: item.employee_id,
  //             go_send_id: item.go_send_id,
  //             tariff: item.tariff,
  //             discount: item.discount,
  //             agent_commission: item.agent_commission,
  //             other_fee: item.other_fee,
  //             book_date: item.book_date,
  //             total_passenger: item.total_passenger,
  //             payment: item.payment,
  //             status: item.status,
  //             status_passenger: item.status_passenger,
  //             note: item.note,
  //             description: item.description,
  //             resi_number: item.resi_number,
  //             cancel: item.cancel,
  //             move: item.move,
  //             position: item.position,
  //             charter: item.charter,
  //             check_payment: item.check_payment,
  //             updatedAt: item.updatedAt,
  //             updated_by: item.updated_by,
  //             createdAt: item.createdAt,
  //             created_by: item.created_by,
  //           },
  //         ],
  //       });
  //     }

  //     return acc;
  //   }, []);
  //   this.groupAdmin = resultGroup;
  //   console.log(this.groupAdmin);
  // }

  ngOnDestroy() {
    sessionStorage.removeItem('city');
    sessionStorage.removeItem('printlist');
    sessionStorage.removeItem('printlistdate');
  }
}
