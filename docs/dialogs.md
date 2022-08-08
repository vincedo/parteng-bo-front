# Parteng Dialogs

[TOC]


## Dialog Components (`AbstractDialogComponent`)

### Definition

A dialog component is an Angular Material dialog displaying a component. It facilitates interactions with the dialog (close, safeClose...).

Dialog components are component classes that:

- Extend `AbstractDialogComponent<R>`, where `R` is the result produced by the dialog.
- Use `<parteng-dialog>` in their template to render the dialog.

Features of dialog components:

- The NgRx `Store` is injected automatically (`this.store`).
- Methods to close the dialog:
  - `closeDialog()` — Force close the dialog
  - `safeCloseDialog()` — Warns the user if the dialog has pending changes
  - `submitAndCloseDialog(RESULT)` — Close while submitting a result
- `isDirty` prop indicates whether dialog has pending changes. Update with `markAsDirty()`.

### Example

In the component class, create 2 methods:

- One to mark the dialog as dirty when its state changes.
- On to submit the dialogs "result" with `submitAndCloseDialog(RESULT)`.

```typescript
export class DialogGoalSelectorComponent extends AbstractDialogComponent<DialogGoalSelectorResult> {
  state$ = this.store.select(selectDialogGoalSelectorState);

  constructor(dialogRef: MatDialogRef<DialogGoalSelectorComponent, DialogGoalSelectorResult>) {
    super(dialogRef);
  }

  onSelectedGoalsChanged(): void {
    this.markAsDirty();
  }

  submitSelectedGoals(goals: Goal[]): void {
    this.submitAndCloseDialog(goals);
  }
}
```

Template :

- The dialog binds its [isSubmitDisabled] and (submit) to a template variable referencing the child component (`checkboxList`).
- When the dialog's Submit is pressed, a method is called on the child component so that it emits its "result" back to the parent `(selectedGoalsSubmitted)="submitSelectedGoals($event)"`. This lets us always retrieve the data from the child, even if it hasn't been modified/emitted yet.

```html
<parteng-dialog
  [isSubmitDisabled]="checkboxList.noSelectedGoals"
  (safeClose)="safeCloseDialog()"
  (cancel)="closeDialog()"
  (submit)="checkboxList.submitSelectedGoals()"
>
  <parteng-goal-list-checkboxes
    #checkboxList
    [allGoals]="state.allGoals"
    [selectedGoals]="state.selectedGoals"
    (selectedGoalsChanged)="onSelectedGoalsChanged()"
    (selectedGoalsSubmitted)="submitSelectedGoals($event)"
  ></parteng-goal-list-checkboxes>
</parteng-dialog>
```

### Which components are dialog components?

- Goal Selector - `DialogGoalSelectorComponent`
- Goal Enricher - `DialogGoalEnricherComponent`
- Item Selector - `DialogItemSelectorComponent`
- All `AbstractFormDialogComponent`'s. See [Forms Documentation](forms.md).


## Handling State Updates from Dialogs

### Regular Dialogs

Regular dialogs are **opened** with an NgRx effect that re-dispatches 2 actions on `dialogRef.afterClosed()`:

- A "dialog submitted" action with a payload — Will update the state
- A "dialog closed" action with NO payload — Will reset the dialog state

Note that both actions are dispatched **after** the dialog was closed.

Example:

- EFFECT: `openDialogScopeSelector()`
  - ACTION: `submitSelectedScopes({ scopes })`
  - ACTION: `dialogScopeSelectorClosed()`

### Async Dialogs

Async dialogs work a bit differently cause they need to dispatch an action **before** the dialog is closed (typically, submitting data to the backend).

Async dialogs are opened with an NgRX effect that do not dispatch (`{ dispatch: false }`).

It means async dialogs are responsible for dispatching their own actions, typically:

- SUBMIT ACTION: Triggers the async operation, which can result in a SUCCESS action or ERROR action.
- DIALOG CLOSED ACTION: The dialog was closed with no async operation.

Example:

```typescript
export class DialogPersonForGoalFormComponent extends AbstractFormDialogComponent<Person> {

  constructor(...) {
    // Action to dispatch when DIALOG IS CLOSED
    this.asyncDialogClosedAction = projectFormActions.dialogPersonForGoalFormClosed();
  }

  onFormSubmitted(person: Person): void {

    // Dispatch a SUBMIT action that will result in (ASYNC) SUCCESS or ERROR
    this.store.dispatch(projectFormActions.submitDialogPersonForGoalForm({ person }));
  }
}
```

The ASYNC SUCCESS or ERROR actions are dispatched from an effect:

- EFFECT (submit action): `submitDialogPersonForGoalForm({ person })`
  - SUCCESS ACTION: `savePersonForGoalSuccess({ person })`
  - ERROR ACTION: `savePersonForGoalError({ error })`

The ERROR action should leave the dialog open to show the error.

The SUCCESS action should "close the dialog with data":

- Name this action in a way that makes it clear that the close has a payload, e.g. `dialogPersonForGoalFormClosedWithData()`.
- This action is also responsible for resetting the state of the dialog. (Meaning the "asyncDialogClosedAction" is not called automatically when closing with data).


## Item Selectors

The Item Selector is a specific kind of dialog component.

An item selector is a component class with these characteristics:

- It implements `DialogItemSelector<ITEM>` where `ITEM` is the type of item being handled.
- It uses `<parteng-dialog-item-selector>` in its template.

### Which components are item selectors?

- Scope Selector - `DialogScopeSelectorComponent`
- Person Selector - `DialogPersonSelectorComponent`

NB. Some components appear like item selectors but they aren't, e.g. `DialogGoalSelectorComponent` (this one doesn't follow the pattern and is a regular `AbstractDialogComponent`).
