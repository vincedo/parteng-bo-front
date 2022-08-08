import { TestBed } from '@angular/core/testing';
// import 'reflect-metadata';
import { DateService } from './date.service';

describe('DateService', () => {
  let service: DateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateService);
    jest.resetAllMocks();
  });

  it('should create', () => {
    expect(service).toBeDefined();
  });

  it('should return now', () => {
    const fakeNow = new Date('2019-05-14T11:01:58.135Z').valueOf();
    jest.spyOn(Date, 'now').mockImplementationOnce(() => fakeNow);
    expect(service.now()).toBe(fakeNow);
  });
});
