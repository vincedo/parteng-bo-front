import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseComponent } from '@app/core/components';
import { JsHelper } from '@app/core/helpers';
import { Instrument2 } from '@app/data-entry/models/instrument.model';
import { combineLatest, map, Observable, of, startWith } from 'rxjs';

@Component({
  selector: 'parteng-instruments-list',
  template: `
    <div class="h-full flex flex-col">
      <form [formGroup]="textFilterForm">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>{{ 'shared.searchFieldLabel' | translate }}</mat-label>
          <input matInput formControlName="textFilter" cdkFocusInitial data-testId="instruments-search-text" />
          <mat-icon matSuffix class="text-blue-ptg-primary-800">search</mat-icon>
        </mat-form-field>
      </form>

      <div class="flex-auto overflow-y-auto" *ngIf="filteredInstruments$ | async as filteredInstruments">
        <parteng-instruments-list-table
          [instruments]="filteredInstruments"
          [selectedInstrument]="selectedInstrument"
          (rowClicked)="onInstrumentClicked($event)"
        ></parteng-instruments-list-table>
      </div>
      <div class="text-sm p-3 rounded mt-3 border min-h-[100px]">
        <div class="text-blue-ptg-primary-800">
          {{ 'dataEntry.pageInstrumentsList.comment' | translate }}
          <div *ngIf="selectedInstrument" class="text-neutral-700">
            {{ selectedInstrument.comment || '-' }}
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstrumentsListComponent extends BaseComponent {
  @Input() instruments: Instrument2[] = [];
  @Output() instrumentSelected = new EventEmitter<Instrument2>();

  textFilterForm!: FormGroup;
  filteredInstruments$: Observable<Instrument2[]> | undefined;
  selectedInstrument: Instrument2 | undefined;
  textFilter$: Observable<string> = of('');

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.textFilterForm = this.fb.group({ textFilter: [''] });
    this.textFilter$ = this.textFilterForm.valueChanges.pipe(
      startWith(undefined),
      map((textFilter) => textFilter?.textFilter || '')
    );
    this.update();
  }

  ngOnChanges() {
    this.textFilterForm?.reset();
    this.selectedInstrument = undefined;
    this.update();
  }

  update() {
    const normalize = (str: string) => JsHelper.strNormalize(str, { trim: true, lowercase: true, removeAccents: true });
    this.filteredInstruments$ = combineLatest([of(this.instruments), this.textFilter$]).pipe(
      map(([instruments, textFilter]) => {
        // TODO: do it with observables ?
        this.selectedInstrument = undefined;
        return instruments.filter((instrument) => {
          return (
            normalize(instrument.name || '').includes(normalize(textFilter)) ||
            normalize(instrument.comment || '').includes(normalize(textFilter)) ||
            normalize(instrument.id.toString()) === normalize(textFilter) ||
            normalize(instrument.instrumentType?.name || '').includes(normalize(textFilter))
          );
        });
      })
    );
  }

  onInstrumentClicked(instrument: Instrument2) {
    this.selectedInstrument = instrument;
    this.instrumentSelected.emit(instrument);
  }
}
