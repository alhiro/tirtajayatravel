import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';
import { SubCategoryModel } from './models/subcategory.model';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { CategoryModel } from '../category/models/category.model';

@Injectable({
  providedIn: 'root',
})
export class SubCategoryService {
  constructor(private httpService: HttpService) {}

  list(context: PaginationContext): Observable<SubCategoryModel> {
    return this.httpService.subCategoryList(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  edit(context: SubCategoryModel): Observable<SubCategoryModel> {
    return this.httpService.subCategoryEdit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  create(context: SubCategoryModel): Observable<SubCategoryModel> {
    return this.httpService.subCategoryCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }
}
