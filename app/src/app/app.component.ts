import { Component } from '@angular/core';
import { BaseComponent } from './core/components';
import { CompletedService } from './core/services/completed.service';
import { ErrorService } from './core/services/error.service';
import { TaskService } from './core/services/task.service';

@Component({
  selector: 'parteng-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends BaseComponent {
  title = 'parteng-bo-front';
  envInfo = this.config.getEnvironmentInfo();

  constructor(private taskService: TaskService, errorService: ErrorService, completedService: CompletedService) {
    super();
    this.taskService.setErrorService(errorService);
    this.taskService.setCompletedService(completedService);
  }
}
