import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Observable } from 'rxjs';

export interface IWaitService {
  startWait(task: any, param: any): void;
  stopWait(task: any, param: any): void;
}

export interface IErrorService {
  onError(error: any, param: any): void;
}

export interface ICompletedService {
  onCompleted(data: any, param: any): void;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private waitService: IWaitService | undefined;
  private errorService: IErrorService | undefined;
  private completedService: ICompletedService | undefined;

  constructor(private translateService: TranslateService) {}

  setWaitService(waitService: IWaitService) {
    this.waitService = waitService;
  }

  setErrorService(errorService: IErrorService) {
    this.errorService = errorService;
  }

  setCompletedService(completedService: ICompletedService) {
    this.completedService = completedService;
  }

  async do(promise: Promise<any>, params?: { wait?: any; error?: any; completed?: any }): Promise<any> {
    if (this.waitService !== undefined) {
      this.waitService.startWait(promise, params?.wait);
    }
    try {
      const data = await promise;
      if (this.waitService !== undefined) {
        this.waitService.stopWait(promise, params?.wait);
      }
      if (this.completedService !== undefined) {
        this.completedService.onCompleted(data, params?.completed);
      }
      return data;
    } catch (error) {
      // console.log(`Error in TaskService.do()`, error);
      // TODO: improve
      if (this.waitService !== undefined) {
        this.waitService.stopWait(promise, params?.wait);
      }
      if (this.errorService !== undefined) {
        this.errorService.onError(error, params?.error);
      }
    }
  }

  async doSave(promise: Promise<any>): Promise<any> {
    return this.do(promise, {
      completed: this.translateService.instant('shared.saveSuccess'),
      error: this.translateService.instant('shared.saveFail'),
    });
  }

  async doDelete(promise: Promise<any>): Promise<any> {
    return this.do(promise, {
      completed: this.translateService.instant('shared.deleteSuccess'),
      error: this.translateService.instant('shared.deleteFail'),
    });
  }

  async doSave$(obs$: Observable<unknown>): Promise<any> {
    return this.do(firstValueFrom(obs$), {
      completed: this.translateService.instant('shared.saveSuccess'),
      error: this.translateService.instant('shared.saveFail'),
    });
  }

  async doDelete$(obs$: Observable<unknown>): Promise<any> {
    return this.do(firstValueFrom(obs$), {
      completed: this.translateService.instant('shared.deleteSuccess'),
      error: this.translateService.instant('shared.deleteFail'),
    });
  }
}
