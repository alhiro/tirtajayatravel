export interface PaginationContext {
  limit: number;
  page: number;
  search: any;
  startDate: any;
  endDate: any;
}

// Pagination
export interface Pagination {
  limit: number;
  offset: number;
  count: number;
  search: string;
  startDate: any;
  endDate: any;
}
export const defaultPagination: Pagination = {
  limit: 10,
  offset: 1,
  count: -1,
  search: '',
  startDate: '',
  endDate: '',
};

// Param
export class Params {
  limit = 10;
  page = 1;
  search = '';
  startDate = '';
  endDate = '';
}
export const defaultParams: Params = {
  limit: 10,
  page: 1,
  search: '',
  startDate: '',
  endDate: '',
};
