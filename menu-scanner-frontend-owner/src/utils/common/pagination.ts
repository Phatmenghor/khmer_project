export interface BasePagination {
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type Pagination = BasePagination;

export interface PaginationResponseModel<T> extends BasePagination {
  content: T[];
}

