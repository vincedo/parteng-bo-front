import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { IWaitService } from './task.service';

// TODO: not used so far
@Injectable({ providedIn: 'root' })
export class WaitService implements IWaitService {
  constructor(private ngxSpinnerService: NgxSpinnerService) {}

  startWait() {
    this.ngxSpinnerService.show();
  }

  stopWait() {
    this.ngxSpinnerService.hide();
  }
}
