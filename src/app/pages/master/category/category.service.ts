import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';
import { CategoryModel } from './models/category.model';
import { PaginationContext } from '@app/@shared/interfaces/pagination';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private httpService: HttpService) {}

  all(): Observable<CategoryModel> {
    return this.httpService.categoryAll().pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  list(context: PaginationContext): Observable<CategoryModel> {
    return this.httpService.categoryList(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  edit(context: CategoryModel): Observable<CategoryModel> {
    return this.httpService.categoryEdit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  create(context: CategoryModel): Observable<CategoryModel> {
    return this.httpService.categoryCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }
}
