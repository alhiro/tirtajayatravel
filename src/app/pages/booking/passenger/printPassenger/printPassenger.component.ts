import { Component, OnDestroy, OnInit } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-printPassenger',
  templateUrl: './printPassenger.component.html',
  styleUrls: ['./printPassenger.component.scss'],
})
export class PrintPassengerComponent implements OnInit, OnDestroy {
  data: any;
  public nowDate!: Date;

  constructor() {}

  ngOnInit() {
    document.documentElement.setAttribute('data-bs-theme', 'light');

    this.nowDate = new Date();
    this.getPrint();
  }

  getPrint() {
    // const currentState = this.router.lastSuccessfulNavigation;
    // this.data = currentState?.extras.state?.['data'];
    // this.dataPackages = this.data.employee?.['packages'];

    const getData: any = sessionStorage.getItem('printpassenger');
    const objData = JSON.parse(getData);
    console.log(objData);

    this.data = objData;
  }

  openModalShare(value: any) {
    const data = document.getElementById('pdf-content');
    if (data) {
      html2canvas(data, {
        scale: 3,
        useCORS: true,
      }).then((canvas) => {
        const imgWidth = 208;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const contentDataURL = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');

        pdf.addImage(contentDataURL, 'JPEG', 0, 0, imgWidth, imgHeight, '', 'FAST');
        pdf.save(`paket_${value.sender.name}, ${value.book_date}.pdf`);
      });
    }
  }

  downloadImageShare(value: any) {
    const data = document.getElementById('pdf-content');
    if (data) {
      html2canvas(data, {
        scale: 3,
        useCORS: true,
      }).then((canvas) => {
        const imageDataURL = canvas.toDataURL('image/jpeg', 1.0);

        const link = document.createElement('a');
        link.href = imageDataURL;
        link.download = `paket_${value.sender.name}, ${value.book_date}.jpg`;
        link.click();
      });
    }
  }

  ngOnDestroy() {
    sessionStorage.removeItem('printpassenger');
  }
}
