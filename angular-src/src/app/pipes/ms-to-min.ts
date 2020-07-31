import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'msToMin' })
export class MsToMinPipe implements PipeTransform {
  transform(duration_ms: number): string {
    const seconds: number = Math.floor(duration_ms / 1000);
    const minutes: number = Math.floor(seconds / 60);
    return (
      minutes.toString() +
      ':' +
      (seconds - minutes * 60).toString().padStart(2, '0')
    );
  }
}
