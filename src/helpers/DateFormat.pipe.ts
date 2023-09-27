import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { Constants } from 'src/utils/constants';

@Pipe({
  name: 'DateFormat',
})
export class DateFormatPipe extends DatePipe implements PipeTransform {
  override transform(value: any, args?: any): any {
    return super.transform(value, Constants.DATE_FMT);
  }
}
