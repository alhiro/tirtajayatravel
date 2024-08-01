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
    return credentials?.authToken;
  }

  getUid(): string {
    const credentials =
      JSON.parse(localStorage.getItem('credentials')!) || JSON.parse(sessionStorage.getItem('credentials')!);
    return credentials?.uid;
  }

  getUsername(): string {
    const credentials =
      JSON.parse(localStorage.getItem('credentials')!) || JSON.parse(sessionStorage.getItem('credentials')!);
    return credentials?.userName;
  }

  getLevel(): number {
    const credentials =
      JSON.parse(localStorage.getItem('credentials')!) || JSON.parse(sessionStorage.getItem('credentials')!);
    return credentials?.level;
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

  indonesiaDateFormat(date: Date) {
    // Get the current date and time in UTC format
    const currentDate = date;
    // Convert the UTC date to a string in the format "YYYY-MM-DDTHH:mm:ssZ"
    const currentDateUTCString = currentDate.toUTCString();
    console.log('currentDateUTCString ' + currentDateUTCString);

    const globalTimezone = 'Asia/Jakarta';
    const globalDate = new Date(currentDateUTCString).toLocaleString('en-US', {
      timeZone: globalTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const getDate = new Date(globalDate);
    console.log('globalDate', getDate);
    return getDate;
  }

  sumTotal(data: any) {
    // Check if all values are null
    const allNull = data.every((item: any) => item === null);
    // If all values are null, return 0
    if (allNull) {
      return 0;
    }
    // Use reduce to sum the data, treating null as 0
    const total = data.reduce((acc: any, item: any) => acc + (item || 0), 0);
    return total;
  }
}

export function toInteger(value: any): number {
  return parseInt(`${value}`, 10);
}

export function toString(value: any): string {
  return value !== undefined && value !== null ? `${value}` : '';
}

export function getValueInRange(value: number, max: number, min = 0): number {
  return Math.max(Math.min(value, max), min);
}

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isNumber(value: any): value is number {
  return !isNaN(toInteger(value));
}

export function isInteger(value: any): value is number {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

export function isDefined(value: any): boolean {
  return value !== undefined && value !== null;
}

export function padNumber(value: number) {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  } else {
    return '';
  }
}

export function regExpEscape(text: any) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function hasClassName(element: any, className: string): boolean {
  return (
    element && element.className && element.className.split && element.className.split(/\s+/).indexOf(className) >= 0
  );
}
