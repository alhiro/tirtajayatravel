import { ElementRef, Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

const countdownTimeUnits: Array<[string, number]> = [
  ['Y', 1000 * 60 * 60 * 24 * 365], // years
  ['M', 1000 * 60 * 60 * 24 * 30], // months
  ['D', 1000 * 60 * 60 * 24], // days
  ['H', 1000 * 60 * 60], // hours
  ['m', 1000 * 60], // minutes
  ['s', 1000], // seconds
  ['S', 1], // million seconds
];

@Injectable({
  providedIn: 'root',
})
export class Utils {
  getToken(): string {
    const credentials =
      JSON.parse(localStorage.getItem('credentials')!) || JSON.parse(sessionStorage.getItem('credentials')!);
    return credentials?.token;
  }

  getUid(): string {
    const credentials =
      JSON.parse(localStorage.getItem('credentials')!) || JSON.parse(sessionStorage.getItem('credentials')!);
    return credentials?.uid;
  }

  getUsername(): string {
    const credentials =
      JSON.parse(localStorage.getItem('credentials')!) || JSON.parse(sessionStorage.getItem('credentials')!);
    return credentials?.username;
  }

  getUUID(): string {
    const token = localStorage.getItem('UUID')! || sessionStorage.getItem('UUID')!;
    return token;
  }

  setUUID(): void {
    localStorage.setItem('UUID', uuidv4());
  }

  getEmail(): string {
    const token =
      JSON.parse(localStorage.getItem('credentials')!) || JSON.parse(sessionStorage.getItem('credentials')!);
    return token?.email;
  }

  getRefreshToken(): string {
    const token =
      JSON.parse(localStorage.getItem('credentials')!) || JSON.parse(sessionStorage.getItem('credentials')!);
    return token?.refreshToken;
  }

  getRoute(): string {
    const route = JSON.parse(localStorage.getItem('router')!) || JSON.parse(sessionStorage.getItem('router')!);
    return route;
  }

  decodeJwt(jwt: string): any {
    const decodeToken: any = jwtDecode(jwt);
    return decodeToken;
  }

  clearAllLocalstorage(): void {
    localStorage.clear();
  }

  currencyFormat(num: any): string {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.') + ',00';
  }

  formDataBlob(name: any, file: any): any {
    const formData = new FormData();
    for (const files of file.files) {
      formData.set(name, new Blob([files], { type: files.type }), files.name);
    }
    return formData;
  }

  downloadFile(data: any): void {
    const arrayBuffer: any = this.base64ToArrayBuffer(data.asBase64String);
    const blob = new Blob([arrayBuffer], { type: data.mimeType });
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = data.fileName;
    downloadLink.click();
  }

  base64ToArrayBuffer(base64: string): ArrayBufferLike {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  downloadICS(data: any, name: string) {
    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('style', 'display: none');
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  isLogin(): boolean {
    return !!localStorage.getItem('token');
  }

  compareDate(dateTimeA: any, dateTimeB: any): number {
    var momentA = moment(dateTimeA, 'DD/MM/YYYY');
    var momentB = moment(dateTimeB, 'DD/MM/YYYY');
    if (momentA > momentB) return 1;
    else if (momentB < momentA) return -1;
    else return 0;
  }

  setMode(mode: string) {
    localStorage.setItem('mode', mode);
  }

  getMode(): string {
    return localStorage.getItem('mode')!;
  }

  downloadDB(file: any) {
    const aEle: ElementRef['nativeElement'] = document.createElement('a');
    document.body.appendChild(aEle);
    aEle.style = 'display: none';
    aEle.download = file.fileName;
    aEle.href = 'data:application/zip;base64,' + file.fileContent;
    aEle.click();
    URL.revokeObjectURL(aEle.href);
  }

  roundup(v: number) {
    return Math.pow(10, Math.ceil(Math.log10(v)));
  }

  uniqueValue(value: any, index: any, array: string | any[]) {
    return array.indexOf(value) === index;
  }

  hasDuplicateObjects(arr: { [key: string]: any }[]): any {
    const seen: { [key: string]: boolean } = {};
    const duplicates: any = [];

    for (const obj of arr) {
      const objString = JSON.stringify(obj);
      if (seen[objString]) {
        duplicates.push(obj);
      } else {
        seen[objString] = true;
      }
    }

    return duplicates;
  }
}
