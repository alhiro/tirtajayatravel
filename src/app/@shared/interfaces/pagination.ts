// Params
export interface PaginationContext {
  limit: any;
  page: any;
  search: string;
  startDate: any;
  endDate: any;
}

export const defaultPage: PaginationContext = {
  limit: 10,
  page: 1,
  search: '',
  startDate: '',
  endDate: '',
};

// Extended params
export interface ExtendedPaginationContext extends PaginationContext {
  city?: string;
  status?: string;
  username?: string;
}
export const defaultPageExtended: ExtendedPaginationContext = {
  limit: 10,
  page: 1,
  search: '',
  startDate: '',
  endDate: '',
  city: '',
  status: '',
};

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
// Extended pagination
export interface ExtendedPagination extends Pagination {
  city?: string;
  status?: string;
}
export const defaultPaginationExtended: ExtendedPagination = {
  limit: 10,
  offset: 1,
  count: -1,
  search: '',
  startDate: '',
  endDate: '',
  city: '',
  status: '',
};

// Param
export interface Params {
  limit: any;
  page: any;
  search: string;
  startDate: any;
  endDate: any;
}
export const defaultParams: Params = {
  limit: 10,
  page: 1,
  search: '',
  startDate: '',
  endDate: '',
};

// Date
export interface Dates {
  startDate: any;
  endDate: any;
}
export const Dates: Dates = {
  startDate: '',
  endDate: '',
};
