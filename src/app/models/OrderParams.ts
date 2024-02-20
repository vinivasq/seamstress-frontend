import { PageParams } from './PageParams';

export class OrderParams extends PageParams {
  customerId?: number;
  orderedAtStart: Date;
  orderedAtEnd: Date;
  steps?: number[];

  constructor(page: number, itemsPerPage: number, term?: string) {
    super(page, itemsPerPage, term);
  }
}
