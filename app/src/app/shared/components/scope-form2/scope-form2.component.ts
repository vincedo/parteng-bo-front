import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { AbstractFormComponent } from '@app/core/components';
import { JsHelper } from '@app/core/helpers';
import { Scope, World } from '@app/project/models';

@Component({
  selector: 'parteng-scope-form2',
  templateUrl: './scope-form2.component.html',
  styles: [
    `
      .field {
        @apply my-4;
      }
      .label {
        @apply text-blue-ptg-primary text-xs mr-3;
      }
      .value {
        @apply text-black-ptg font-bold text-sm;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScopeForm2Component extends AbstractFormComponent<Scope> {
  @Input() scope!: Scope;
  @Input() worlds!: World[];
  @Input() mode!: 'create' | 'view' | 'edit';

  @Output() modeChanged = new EventEmitter<'create' | 'view' | 'edit'>();

  isWorldsFieldReady = false;

  get isWorldsInvalid(): boolean {
    const control = this.form.get('worlds');
    return control ? control.dirty && control.invalid : false;
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    if (changes['worlds'] && !changes['worlds'].firstChange && this.worlds) {
      this.setupWorldsField();
    }
  }

  buildForm(): void {
    // NB. The "worlds" field is added separately, after the async "worlds" input is received.
    this.form = this.fb.group({
      code: [this.scope.code, Validators.required],
      name: [this.scope.name, Validators.required],
      historical_name: [this.scope.historicalName],
      city: [this.scope.city],
      comment: [this.scope.comment],
    });
  }

  private setupWorldsField(): void {
    const worldsFormGroupConfig: { [k: string]: any } = {};
    for (const world of this.worlds) {
      const isWorldSelected = this.scope.worlds.some((w) => w.id === world.id);
      worldsFormGroupConfig[`${world.id}`] = [isWorldSelected];
    }
    this.form.addControl(
      'worlds',
      this.fb.group(worldsFormGroupConfig, { validators: atLeastOneWorldSelectedValidator() })
    );
    this.isWorldsFieldReady = true;
  }

  serializeForm(): Scope {
    const formData = this.form!.value;

    // Process worlds
    const worldIds = JsHelper.objGetKeysTrue(formData.worlds).map(Number);
    const worlds = worldIds.map((id) => this.worlds.find((w) => w.id === id)!);

    const scope = new Scope();
    scope.id = this.scope.id;
    scope.status = this.scope.status;
    scope.code = `${formData.code}`.toUpperCase();
    scope.name = formData.name;
    scope.historicalName = formData.historical_name;
    scope.city = formData.city;
    scope.comment = formData.comment;
    scope.worlds = worlds;

    return scope;
  }

  switchToEditMode(): void {
    this.modeChanged.emit('edit');
  }

  stringifyScopeWorlds(scope: Scope): string {
    return scope.worlds.map((w) => w.name).join(', ');
  }
}

//
//
//

function atLeastOneWorldSelectedValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const error = !!control.value && JsHelper.objGetKeysTrue(control.value).length === 0;
    return error ? { noWorldSelected: true } : null;
  };
}
