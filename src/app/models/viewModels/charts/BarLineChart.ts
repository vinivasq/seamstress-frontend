export class BarLineChart {
  labels: Array<string>;
  dataSets: Array<BarLineDataSet>;
}

class BarLineDataSet {
  data: Array<string>;
  type: string;
  label: string;
}
