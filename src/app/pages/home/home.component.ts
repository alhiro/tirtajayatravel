import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { QuoteService } from './quote.service';
import { ModalComponent, ModalConfig } from '@app/_metronic/partials';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  dataSummary: any;
  quote: string | undefined;
  isLoading = false;

  public getDataPackagePassengerMalang: any;
  public getDataPackagePassengerSurabaya: any;

  public getDataPackageMalang: any;
  public getDataPackageSurabaya: any;
  public getDataPassengerMalang: any;
  public getDataPassengerSurabaya: any;

  // Paket Penumpang
  public paketPassengerMalang: any;
  public paketPassengerSurabaya: any;
  public totalPaketPassengerMalang: any;
  public totalPaketPassengerSurabaya: any;

  public progressPercentagePackagePassengerMalang = 0;
  public progressPercentagePackagePassengerSurabaya = 0;

  // Paket Progress Paket Malang
  public listDataPackageMalang: any;
  public progressPercentagePackageMalang: any;
  // Paket Progress Paket Send Malang
  public listDataPackageSendMalang: any;
  public progressPercentagePackageSendMalang: any;
  // Paket Progress Paket No Take Malang
  public listDataPackageNoTakeMalang: any;
  public progressPercentagePackageNoTakeMalang: any;
  // Paket Progress Paket Take Malang
  public listDataPackageTakeMalang: any;
  public progressPercentagePackageTakeMalang: any;
  // Paket Progress Penumpang Malang
  public listDataPassengerMalang: any;
  public progressPercentagePassengerMalang: any;

  // Paket Progress Paket Surabaya
  public listDataPackageSurabaya: any;
  public progressPercentagePackageSurabaya: any;
  // Paket Progress Paket Send Surabaya
  public listDataPackageSendSurabaya: any;
  public progressPercentagePackageSendSurabaya: any;
  // Paket Progress Paket No Take Surabaya
  public listDataPackageNoTakeSurabaya: any;
  public progressPercentagePackageNoTakeSurabaya: any;
  // Paket Progress Paket Take Surabaya
  public listDataPackageTakeSurabaya: any;
  public progressPercentagePackageTakeSurabaya: any;
  // Paket Progress Penumpang Surabaya
  public listDataPassengerSurabaya: any;
  public progressPercentagePassengerSurabaya: any;

  modalConfig: ModalConfig = {
    modalTitle: 'Modal title',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  @ViewChild('modal') private modalComponent!: ModalComponent;

  constructor(
    private homeService: HomeService,
    private readonly cdr: ChangeDetectorRef,
    private quoteService: QuoteService
  ) {}

  ngOnInit() {
    this.summary();
  }

  summary() {
    this.isLoading = true;
    this.homeService
      .summary()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((resp) => {
        this.dataSummary = resp;

        // Package
        const getDataPackage = this.dataSummary?.find((data: any) => data.type === 'Package');
        this.getDataPackageMalang = getDataPackage?.data?.find((data: any) => data.name === 'Malang');
        console.log(this.getDataPackageMalang);
        this.getDataPackageSurabaya = getDataPackage?.data?.find((data: any) => data.name === 'Surabaya');
        console.log(this.getDataPackageSurabaya);

        // Passenger
        const getDataPassenger = this.dataSummary?.find((data: any) => data.type === 'Passenger');
        this.getDataPassengerMalang = getDataPassenger?.data?.find((data: any) => data.name === 'Malang');
        console.log(this.getDataPassengerMalang);
        this.getDataPassengerSurabaya = getDataPassenger?.data?.find((data: any) => data.name === 'Surabaya');
        console.log(this.getDataPassengerSurabaya);

        if (this.getDataPackageMalang) {
          // Progress Paket Malang
          const paketProgressMalang = parseInt(this.getDataPackageMalang?.count_progress) || 0;
          const totalPaketProgressMalang = parseInt(this.getDataPackageMalang?.count_completed) || 0;
          this.progressPercentagePackageMalang =
            paketProgressMalang || totalPaketProgressMalang === 0
              ? 0
              : (totalPaketProgressMalang / paketProgressMalang) * 100;
          this.listDataPackageMalang = {
            progress: paketProgressMalang,
            totalProgress: totalPaketProgressMalang,
            percentage: this.progressPercentagePackageMalang || 0,
          };

          // Progress Paket Sudah Kirim Malang
          const paketProgressSendMalang = parseInt(this.getDataPackageMalang?.count_delivery) || 0;
          const totalPaketProgressSendMalang = parseInt(this.getDataPackageMalang?.count_completed) || 0;
          this.progressPercentagePackageSendMalang =
            paketProgressSendMalang || totalPaketProgressSendMalang === 0
              ? 0
              : (totalPaketProgressSendMalang / paketProgressSendMalang) * 100;
          this.listDataPackageSendMalang = {
            progress: paketProgressSendMalang,
            totalProgress: totalPaketProgressSendMalang,
            percentage: this.progressPercentagePackageSendMalang || 0,
          };
          console.log(`${paketProgressSendMalang}, ${totalPaketProgressSendMalang}`);
          console.log(this.progressPercentagePackageSendMalang);
          console.log(this.listDataPackageSendMalang);

          // Progress Paket Belum Diambil Malang
          const paketProgressNoTakeMalang = parseInt(this.getDataPackageMalang?.count_nocompleted) || 0;
          const totalPaketProgressNoTakeMalang = parseInt(this.getDataPackageMalang?.count_completed) || 0;
          this.progressPercentagePackageNoTakeMalang =
            paketProgressNoTakeMalang || totalPaketProgressNoTakeMalang === 0
              ? 0
              : (totalPaketProgressNoTakeMalang / paketProgressNoTakeMalang) * 100;
          this.listDataPackageNoTakeMalang = {
            progress: paketProgressNoTakeMalang,
            totalProgress: totalPaketProgressNoTakeMalang,
            percentage: this.progressPercentagePackageNoTakeMalang || 0,
          };

          // Progress Paket Sudah Diambil Malang
          const paketProgressTakeMalang = parseInt(this.getDataPackageMalang?.count_completed) || 0;
          const totalPaketProgressTakeMalang = parseInt(this.getDataPackageMalang?.count_completed) || 0;
          this.progressPercentagePackageTakeMalang =
            paketProgressTakeMalang || totalPaketProgressTakeMalang === 0
              ? 0
              : (totalPaketProgressTakeMalang / paketProgressTakeMalang) * 100;
          this.listDataPackageTakeMalang = {
            progress: paketProgressTakeMalang,
            totalProgress: totalPaketProgressTakeMalang,
            percentage: this.progressPercentagePackageTakeMalang || 0,
          };
        } else {
          this.listDataPackageMalang = {
            progress: 0,
            totalProgress: 0,
            percentage: 0,
          };

          this.listDataPackageSendMalang = {
            progress: 0,
            totalProgress: 0,
            percentage: 0,
          };

          this.listDataPackageNoTakeMalang = {
            progress: 0,
            totalProgress: 0,
            percentage: 0,
          };

          this.listDataPackageTakeMalang = {
            progress: 0,
            totalProgress: 0,
            percentage: 0,
          };
        }

        if (this.getDataPackageSurabaya) {
          // Progress Paket Surabaya
          const paketProgressSurabaya = parseInt(this.getDataPackageSurabaya?.count_progress) || 0;
          const totalPaketProgressSurabaya = parseInt(this.getDataPackageSurabaya?.count_completed) || 0;
          this.progressPercentagePackageSurabaya =
            paketProgressSurabaya || totalPaketProgressSurabaya === 0
              ? 0
              : (totalPaketProgressSurabaya / paketProgressSurabaya) * 100;
          this.listDataPackageSurabaya = {
            progress: paketProgressSurabaya,
            totalProgress: totalPaketProgressSurabaya,
            percentage: this.progressPercentagePackageSurabaya || 0,
          };

          // Progress Paket Sudah Kirim Surabaya
          const paketProgressSendSurabaya = parseInt(this.getDataPackageSurabaya?.count_delivery) || 0;
          const totalPaketProgressSendSurabaya = parseInt(this.getDataPackageSurabaya?.count_completed) || 0;
          this.progressPercentagePackageSendSurabaya =
            paketProgressSendSurabaya || totalPaketProgressSendSurabaya === 0
              ? 0
              : (totalPaketProgressSendSurabaya / paketProgressSendSurabaya) * 100;
          this.listDataPackageSendSurabaya = {
            progress: paketProgressSendSurabaya,
            totalProgress: totalPaketProgressSendSurabaya,
            percentage: this.progressPercentagePackageSendSurabaya || 0,
          };

          // Progress Paket Belum Diambil Surabaya
          const paketProgressNoTakeSurabaya = parseInt(this.getDataPackageSurabaya?.count_nocompleted) || 0;
          const totalPaketProgressNoTakeSurabaya = parseInt(this.getDataPackageSurabaya?.count_completed) || 0;
          this.progressPercentagePackageNoTakeSurabaya =
            paketProgressNoTakeSurabaya || totalPaketProgressNoTakeSurabaya === 0
              ? 0
              : (totalPaketProgressNoTakeSurabaya / paketProgressNoTakeSurabaya) * 100;
          this.listDataPackageNoTakeSurabaya = {
            progress: paketProgressNoTakeSurabaya,
            totalProgress: totalPaketProgressNoTakeSurabaya,
            percentage: this.progressPercentagePackageNoTakeSurabaya || 0,
          };

          // Progress Paket Sudah Diambil Surabaya
          const paketProgressTakeSurabaya = parseInt(this.getDataPackageSurabaya?.count_completed) || 0;
          const totalPaketProgressTakeSurabaya = parseInt(this.getDataPackageSurabaya?.count_completed) || 0;
          this.progressPercentagePackageNoTakeSurabaya =
            paketProgressTakeSurabaya || totalPaketProgressTakeSurabaya === 0
              ? 0
              : (totalPaketProgressTakeSurabaya / paketProgressTakeSurabaya) * 100;
          this.listDataPackageTakeSurabaya = {
            progress: paketProgressTakeSurabaya,
            totalProgress: totalPaketProgressTakeSurabaya,
            percentage: this.progressPercentagePackageTakeSurabaya || 0,
          };
        } else {
          this.listDataPackageSurabaya = {
            progress: 0,
            totalProgress: 0,
            percentage: 0,
          };

          this.listDataPackageSendSurabaya = {
            progress: 0,
            totalProgress: 0,
            percentage: 0,
          };

          this.listDataPackageNoTakeSurabaya = {
            progress: 0,
            totalProgress: 0,
            percentage: 0,
          };

          this.listDataPackageTakeSurabaya = {
            progress: 0,
            totalProgress: 0,
            percentage: 0,
          };
        }

        if (this.getDataPassengerMalang) {
          // Progress Passenger Package Malang Have Data
          const paketPassengerMalang = parseInt(this.getDataPassengerMalang?.count_status) || 0;
          const totalPaketPassengerMalang = parseInt(this.getDataPassengerMalang?.count_status_completed) || 0;
          this.progressPercentagePackagePassengerMalang =
            paketPassengerMalang || totalPaketPassengerMalang === 0
              ? 0
              : (totalPaketPassengerMalang / paketPassengerMalang) * 100;
          this.getDataPackagePassengerMalang = {
            progress: paketPassengerMalang,
            totalProgress: totalPaketPassengerMalang,
            percentage: this.progressPercentagePackagePassengerMalang || 0,
          };

          // Progress Passenger Malang Have Data
          const penumpangProgressMalang = parseInt(this.getDataPassengerMalang?.count_progress) || 0;
          const totalPenumpangProgressMalang = parseInt(this.getDataPassengerMalang?.count_completed) || 0;
          this.progressPercentagePassengerMalang =
            penumpangProgressMalang || totalPenumpangProgressMalang === 0
              ? 0
              : (totalPenumpangProgressMalang / penumpangProgressMalang) * 100;
          this.listDataPassengerMalang = {
            progress: penumpangProgressMalang,
            totalProgress: totalPenumpangProgressMalang,
            percentage: this.progressPercentagePassengerMalang || 0,
          };
        } else {
          // Progress Passenger Package Malang No Data
          this.getDataPackagePassengerMalang = {
            progress: 0,
            totalProgress: 0,
            percentage: 0,
          };

          // Progress Passenger Malang No Data
          this.listDataPassengerMalang = {
            progress: 0,
            totalProgress: 0,
            percentage: 0,
          };
        }

        if (this.getDataPassengerSurabaya) {
          // Progress Passenger Package Surabaya Have Data
          const paketPassengerSurabaya = parseInt(this.getDataPassengerSurabaya?.count_status) || 0;
          const totalPaketPassengerSurabaya = parseInt(this.getDataPassengerSurabaya?.count_status_completed) || 0;
          this.progressPercentagePackagePassengerSurabaya =
            paketPassengerSurabaya || totalPaketPassengerSurabaya === 0
              ? 0
              : (totalPaketPassengerSurabaya / paketPassengerSurabaya) * 100;
          this.getDataPackagePassengerSurabaya = {
            progress: paketPassengerSurabaya,
            totalProgress: totalPaketPassengerSurabaya,
            percentage: this.progressPercentagePackagePassengerSurabaya || 0,
          };

          // Progress Passenger Surabaya Have Data
          const penumpangProgressSurabaya = parseInt(this.getDataPassengerSurabaya?.count_progress) || 0;
          const totalPenumpangProgressSurabaya = parseInt(this.getDataPassengerSurabaya?.count_completed) || 0;
          this.progressPercentagePassengerSurabaya =
            penumpangProgressSurabaya || totalPenumpangProgressSurabaya === 0
              ? 0
              : (totalPenumpangProgressSurabaya / penumpangProgressSurabaya) * 100;
          this.listDataPassengerSurabaya = {
            progress: penumpangProgressSurabaya,
            totalProgress: totalPenumpangProgressSurabaya,
            percentage: this.progressPercentagePassengerSurabaya || 0,
          };
        } else {
          // Progress Passenger Package Surabaya No Data
          this.getDataPackagePassengerSurabaya = {
            progress: 0,
            totalProgress: 0,
            percentage: 0,
          };
          // Progress Passenger Surabaya No Data
          this.listDataPassengerSurabaya = {
            progress: 0,
            totalProgress: 0,
            percentage: 0,
          };
        }

        this.cdr.detectChanges();
      });

    // this.quoteService
    //   .getRandomQuote({ category: 'dev' })
    //   .pipe(
    //     finalize(() => {
    //       this.isLoading = false;
    //     })
    //   )
    //   .subscribe((quote: string) => {
    //     this.quote = quote;
    //   });
  }

  async openModal() {
    const data: any = [];
    return await this.modalComponent.open();
  }
}
