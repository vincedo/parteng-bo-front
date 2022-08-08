import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, NgModule } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GenericDialogComponent } from './generic-dialog.component';

// See: http://angular-tips.com/blog/2018/02/testing-angular-material-dialog-templates/

@Component({
  template: '',
})
class NoopComponent {}

const TEST_DIRECTIVES = [NoopComponent, GenericDialogComponent];

@NgModule({
  imports: [MatDialogModule, NoopAnimationsModule],
  exports: TEST_DIRECTIVES,
  declarations: TEST_DIRECTIVES,
  entryComponents: [GenericDialogComponent],
})
class GenericDialogComponentTestModule {}

describe('GenericDialogComponent', () => {
  let dialog: MatDialog;
  let overlayContainerElement: HTMLElement;
  let noop: ComponentFixture<NoopComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GenericDialogComponentTestModule],
      providers: [
        {
          provide: OverlayContainer,
          useFactory: () => {
            overlayContainerElement = document.createElement('div');
            return { getContainerElement: () => overlayContainerElement };
          },
        },
      ],
    }).compileComponents();

    dialog = TestBed.inject(MatDialog);
    noop = TestBed.createComponent(NoopComponent);
  }));

  it('should create the dialog', () => {
    const config = {
      data: {
        title: 'test title',
        text: 'test content',
        choice1: 'test choice1',
        choice2: 'test choice2',
        hasClose: false,
      },
    };
    dialog.open(GenericDialogComponent, config);
    noop.detectChanges();
    const title = overlayContainerElement.querySelector('div[mat-dialog-title]');
    expect(title.textContent).toBe('test title');
    const content = overlayContainerElement.querySelector('div[mat-dialog-content] h3');
    expect(content.textContent).toBe('test content');
    const buttons = overlayContainerElement.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent.trim()).toBe('test choice1');
    expect(buttons[1].textContent.trim()).toBe('test choice2');
  });

  it('should call close when clicking on choice1 button', () => {
    const config = {
      data: {
        title: 'test title',
        text: 'test content',
        choice1: 'test choice1',
        choice2: 'test choice2',
        hasClose: false,
      },
    };
    const dialogRef = dialog.open(GenericDialogComponent, config);
    noop.detectChanges();
    const buttons = overlayContainerElement.querySelectorAll('button');
    const component = dialogRef.componentInstance;
    const spy = jest.spyOn(component, 'close');
    buttons[0].click();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should call close when clicking on choice2 button', () => {
    const config = {
      data: {
        title: 'test title',
        text: 'test content',
        choice1: 'test choice1',
        choice2: 'test choice2',
        hasClose: false,
      },
    };
    const dialogRef = dialog.open(GenericDialogComponent, config);
    noop.detectChanges();
    const buttons = overlayContainerElement.querySelectorAll('button');
    const component = dialogRef.componentInstance;
    const spy = jest.spyOn(component, 'close');
    buttons[1].click();
    expect(spy).toHaveBeenCalledWith(false);
  });
});
