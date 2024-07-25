export interface PaginationContext {
  limit: number;
  page: number;
  search: any;
  startDate: any;
  endDate: any;
}

export class Pagination {
  limit = 0;
  offset = 0;
  count = -1;
  search = '';
  startDate = '';
  endDate = '';
}
export class Params {
  limit = 10;
  page = 1;
  search = '';
  startDate = '';
  endDate = '';
}
