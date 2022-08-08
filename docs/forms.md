# Parteng Forms

[TOC]


## Form Components (`AbstractFormComponent`)

### Definition

A form component is a component class containing a reactive form.

Form components are classes that extend `AbstractFormComponent<R>`,
where `R` is the type of the result produced by the form.

```typescript
export class BookFormComponent extends AbstractFormComponent<Book> { }
```

### Features of Form Components

- Only 2 methods must be implemented:
  - `buildForm()`, called automatically on ngOnInit
  - `serializeForm()`, called automatically when form is submitted
- Support a `backendFormError` **input** (string).
  - Backend error is cleared automatically as soon as form changes.
  - [WIP] Scroll to top automatically on new backend error.
- Emit form result as a `formSubmitted` **output** when form is submitted.

### Example

```typescript
@Component()
export class PersonFormComponent extends AbstractFormComponent<Person> {
  @Input() person!: Person;

  buildForm(): void {
    this.form = this.fb.group({
      name: [this.person.name, Validators.required],
      comment: [this.person.comment],
    });
  }

  serializeForm(): Person {
    const formData = this.form!.value;
    const person: Person = Object.assign(this.person, formData);
    return person;
  }
}
```

## Form Dialogs (`AbstractFormDialogComponent`)

### Definition

A form dialog is a dialog (component) containing a form component (see above).

The goal of form dialogs is to **facilitate communication between the dialog and its child form**.

Form dialogs are classes that extend `AbstractFormDialogComponent<R>`, where `R` is the result produced by the form.

### Features of Form Dialogs

- Implement `onFormSubmitted(RESULT)` to react to form submission.
- Use **local props and methods** if you need to custom interactions with the child form:
  - Properties: `this.form`, `this.isDirty`
  - Methods: `this.triggerFormSubmit()`
- All the features from `AbstractDialogComponent` (`isDirty`, `closeDialog()`...). See [Dialogs Documentation](dialogs.md).

### Example

The component class form dialog must implement these abstract members:

- `formComponent` — A ViewChild referencing the child AbstractFormComponent.
- `formState$` — All data necessary to display the form
- `onFormSubmitted(RESULT)` — Called with form result. Use this to dispatch action to the store.

```typescript
export class DialogPersonFormComponent extends AbstractFormDialogComponent<Person> {
  @ViewChild(PersonFormComponent) formComponent!: PersonFormComponent;

  formState$ = this.store.select(selectPersonFormState);

  constructor(dialogRef: MatDialogRef<DialogPersonFormComponent, DialogPersonFormResult>) {
    super(dialogRef);
  }

  onFormSubmitted(person: Person): void {
    this.store.dispatch(submitDialogPersonForm({ person }));
  }
}
```

And the component template:

```html
<parteng-dialog
  [isSubmitDisabled]="isFormInvalid"
  (safeClose)="safeCloseDialog()"
  (cancel)="closeDialog()"
  (submit)="triggerFormSubmit()">
  <parteng-person-form
    [person]="formState.person"
    (formSubmitted)="onFormSubmitted($event)"
  ></parteng-person-form>
</parteng-dialog>
```


## Form Look & Feel

### Fields

All form fields should be wrapped inside:

```html
<mat-form-field appearance="fill" class="w-full"> ... </mat-form-field>
```

### Buttons

```html
<!-- Submit Button -->
<button type="submit" mat-raised-button color="primary">
</button>

<!-- Standard Button -->
<button type="button" mat-raised-button></button>
</button>
```
