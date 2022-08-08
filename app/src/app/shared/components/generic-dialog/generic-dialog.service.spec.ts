import { TestBed } from '@angular/core/testing';
import { GenericDialogService } from './generic-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { GenericDialogComponent } from './generic-dialog.component';
import { of } from 'rxjs';

const matDialogMock = {
  open: jest.fn(),
};

describe('GenericDialogService', () => {
  let dialogService: GenericDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: matDialogMock }],
    });
    dialogService = TestBed.inject(GenericDialogService);
    jest.resetAllMocks();
  });

  it('should create', () => {
    expect(dialogService).toBeDefined();
  });

  it('should binary...', () => {
    const spy = jest.spyOn(matDialogMock, 'open');
    matDialogMock.open.mockReturnValue({ afterClosed: () => of(true) });
    dialogService.binary('test title', 'test text', 'test choice1', 'test choice2');
    expect(spy).toHaveBeenCalledWith(GenericDialogComponent, {
      width: '400px',
      data: {
        title: 'test title',
        text: 'test text',
        choice1: 'test choice1',
        choice2: 'test choice2',
        hasClose: false,
      },
    });
  });

  it('should error...', () => {
    const spy = jest.spyOn(matDialogMock, 'open');
    matDialogMock.open.mockReturnValue({ afterClosed: () => of(true) });
    dialogService.error('test title', 'test text');
    expect(spy).toHaveBeenCalledWith(GenericDialogComponent, {
      width: '600px',
      data: {
        title: 'test title',
        text: 'test text',
        choice1: 'OK',
        hasClose: false,
      },
    });
  });
});
