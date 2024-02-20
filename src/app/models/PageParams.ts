export class PageParams {
  page: number;
  itemsPerPage: number;
  term?: string;

  constructor(page: number, itemsPerPage: number, term?: string) {
    this.page = page;
    this.itemsPerPage = itemsPerPage;
    this.term = term;
  }
}
