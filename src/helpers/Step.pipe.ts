import { Pipe, PipeTransform } from '@angular/core';
import { Step } from 'src/app/Enums/Step.enum';

@Pipe({
  name: 'Step',
})
export class StepPipe implements PipeTransform {
  transform(value: number): string {
    const enumKey = Object.keys(Step).find((key) => Step[key] === value);
    return enumKey ? enumKey : '';
  }
}
