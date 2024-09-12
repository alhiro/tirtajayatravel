import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { API, APIDefinition, Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { Subject, Subscription, finalize, takeUntil } from 'rxjs';
import { CategoryService } from './category.service';
import {
  Pagination,
  PaginationContext,
  Params,
  defaultPagination,
  defaultParams,
} from '@app/@shared/interfaces/pagination';
import { HttpService } from '@app/services/http.service';
import { ModalComponent, ModalConfig } from '@app/_metronic/partials';

import { CategoryModel } from './models/category.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HandlerResponseService } from '@app/services/handler-response/handler-response.service';

interface EventObject {
  event: string;
  value: {
    limit: number;
    page: number;
  };
}

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit, OnDestroy {
  @ViewChild('table') table!: APIDefinition;
  public columns!: Columns[];
  public data: any;
  public dataLength!: number;
  public toggledRows = new Set<number>();
  public isCreate = false;

  public configuration: Config = { ...DefaultConfig };

  public pagination: Pagination = { ...defaultPagination };
  public params: Params = { ...defaultParams };
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  form!: FormGroup;
  isLoading = false;
  get f() {
    return this.form.controls;
  }

  modalConfigCreate: ModalConfig = {
    modalTitle: 'Create Category',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  modalConfigEdit: ModalConfig = {
    modalTitle: 'Edit Category',
    dismissButtonLabel: 'Submit',
    closeButtonLabel: 'Cancel',
  };
  @ViewChild('modal') private modalComponent!: ModalComponent;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private categoryService: CategoryService,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    private handlerResponseService: HandlerResponseService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.dataList(this.params);

    this.configuration.resizeColumn = true;
    this.configuration.fixedColumnWidth = false;
    this.configuration.orderEnabled = false;

    this.columns = [
      // { key: 'category_id', title: 'No' },
      { key: 'name', title: 'Category' },
      { key: 'createdAt', title: 'Created At' },
      { key: 'updatedAt', title: 'Updated At' },
      { key: '', title: 'Action', cssClass: { includeHeader: true, name: 'text-end' } },
    ];
  }

  private initForm() {
    this.form = this.formBuilder.group({
      category_id: [''],
      name: ['', Validators.compose([Validators.maxLength(100)])],
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  eventEmitted($event: { event: string; value: any }): void {
    if ($event.event === 'onPagination') {
      this.parseEvent($event);
    }
  }

  private parseEvent(obj: EventObject): void {
    this.pagination.limit = obj.value.limit ? obj.value.limit : this.pagination.limit;
    this.pagination.offset = obj.value.page ? obj.value.page : this.pagination.offset;
    this.pagination = { ...this.pagination };
    const params = {
      limit: this.pagination.limit,
      page: this.pagination.offset,
      search: this.pagination.search,
      startDate: this.pagination.startDate,
      endDate: this.pagination.endDate,
    }; // see https://github.com/typicode/json-server
    this.dataList(params);
  }

  private dataList(params: PaginationContext): void {
    this.configuration.isLoading = true;
    this.categoryService
      .list(params)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response: any) => {
        this.dataLength = response.length;
        this.data = response.data;
        // ensure this.pagination.count is set only once and contains count of the whole array, not just paginated one
        this.pagination.count =
          this.pagination.count === -1 ? (response.data ? response.length : 0) : this.pagination.count;
        this.pagination = { ...this.pagination };
        this.configuration.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  async openModalNew() {
    this.isCreate = true;
    return await this.modalComponent.open();
  }

  dataCreate() {
    console.log(this.form.value);
    this.isLoading = true;
    const catSubscr = this.categoryService
      .create(this.form.value)
      .pipe(
        finalize(() => {
          this.form.markAsPristine();
          this.isLoading = false;
        })
      )
      .subscribe(
        async (resp: any) => {
          if (resp) {
            this.snackbar.open(resp.message, '', {
              panelClass: 'snackbar-success',
              duration: 5000,
            });

            this.dataList(this.params);
            await this.modalComponent.dismiss();
          } else {
            this.isLoading = false;
          }
        },
        (error: any) => {
          console.log(error);
          this.isLoading = false;
          this.handlerResponseService.failedResponse(error);
        }
      );
    this.unsubscribe.push(catSubscr);
  }

  async openModalEdit(event: CategoryModel) {
    this.isCreate = false;

    this.form.patchValue({
      category_id: event.category_id,
      name: event.name,
    });

    return await this.modalComponent.open();
  }

  dataEdit() {
    console.log(this.form.value);
    this.isLoading = true;
    const catSubscr = this.categoryService
      .edit(this.form.value)
      .pipe(
        finalize(() => {
          this.form.markAsPristine();
          this.isLoading = false;
        })
      )
      .subscribe(
        async (resp: any) => {
          if (resp) {
            this.snackbar.open(resp.message, '', {
              panelClass: 'snackbar-success',
              duration: 5000,
            });

            this.dataList(this.params);
            await this.modalComponent.dismiss();
          } else {
            this.isLoading = false;
          }
        },
        (error: any) => {
          console.log(error);
          this.isLoading = false;
          this.handlerResponseService.failedResponse(error);
        }
      );
    this.unsubscribe.push(catSubscr);
  }
}
