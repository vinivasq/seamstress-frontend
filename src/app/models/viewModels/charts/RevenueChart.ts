export class RevenueChart {
  labels: Array<string>;
  dataSets: Array<RevenueDataSet>;
}

class RevenueDataSet {
  data: Array<string>;
  type: string;
  label: string;
}
