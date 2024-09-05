import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  constructor(private httpService: HttpService) {}

  summary(): Observable<any> {
    return this.httpService.summary().pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }
}
