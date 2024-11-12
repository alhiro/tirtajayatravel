import { Component, OnDestroy, OnInit } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-printPackage',
  templateUrl: './printPackage.component.html',
  styleUrls: ['./printPackage.component.scss'],
})
export class PrintPackageComponent implements OnInit, OnDestroy {
  data: any;
  public nowDate!: Date;

  constructor() {}

  ngOnInit() {
    this.nowDate = new Date();
    this.getPrint();
  }

  getPrint() {
    // const currentState = this.router.lastSuccessfulNavigation;
    // this.data = currentState?.extras.state?.['data'];
    // this.dataPackages = this.data.employee?.['packages'];

    const getData: any = sessionStorage.getItem('printpackage');
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

  ngOnDestroy() {
    sessionStorage.removeItem('printpackage');
  }
}
