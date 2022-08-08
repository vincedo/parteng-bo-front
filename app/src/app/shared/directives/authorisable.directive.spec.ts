import { fireEvent, render, screen } from '@testing-library/angular';
import '@testing-library/jest-dom';
import { AuthorisableDirective } from './authorisable.directive';
import { PermissionKey, ResourceKey } from '@core/models/authorization.model';
import { createMockWithValues } from '@testing-library/angular/jest-utils';
import { PermissionService } from '@core/services/permission.service';
import { BehaviorSubject, NEVER, of } from 'rxjs';

const permissionSubject = new BehaviorSubject<boolean>(false);
describe('AuthorisableDirective', () => {
  const targets = ['renderedIcon', 'renderedDiv', 'renderedButton'];
  const clickSpy = jest.fn();

  function renderDirective(permission: PermissionKey, resource: ResourceKey, isUnhautorisedHidden = false) {
    const renderedDiv = `<div data-testid="renderedDiv" parteng-requires-permission="${permission}" parteng-requires-resource="${resource}" parteng-hide-unauthorised="${isUnhautorisedHidden}"
    (click)="clickSpy()"
      >this is a div </div>`;
    const renderedIcon = `<mat-icon data-testid="renderedIcon" parteng-requires-permission="${permission}" parteng-requires-resource="${resource}" parteng-hide-unauthorised="${isUnhautorisedHidden}"
    (click)="clickSpy()"
      >edit</mat-icon>`;
    const renderedButton = `<button data-testid="renderedButton" parteng-requires-permission="${permission}" parteng-requires-resource="${resource}" parteng-hide-unauthorised="${isUnhautorisedHidden}"
    (click)="clickSpy()" type="button" mat-stroked-button color="warn"
      >great button</button>`;

    const permissionServiceMock = createMockWithValues(PermissionService, {
      isAuthorized$: jest.fn((p, r) => {
        if (r === 'instruments') return permissionSubject.asObservable();
        if (p !== 'create') return of(p === 'read');
        return NEVER;
      }),
    });

    return render(renderedDiv + renderedIcon + renderedButton, {
      declarations: [AuthorisableDirective],
      providers: [{ provide: PermissionService, useValue: permissionServiceMock }],
      componentProperties: {
        clickSpy: clickSpy,
      },
    });
  }

  it('is disabled by default', async () => {
    const { fixture } = await renderDirective('create', 'projects', true);
    fixture.detectChanges();
    targets.forEach((target) => {
      const element = screen.queryByTestId(target)!;
      expect(element).not.toBeVisible();
    });
  });

  it('is dynamically updated when permission changes', async () => {
    const { fixture } = await renderDirective('create', 'instruments', true);
    fixture.detectChanges();
    targets.forEach((target) => {
      const element = screen.queryByTestId(target)!;
      expect(element).not.toBeVisible();
    });
    permissionSubject.next(true);
    fixture.detectChanges();

    targets.forEach((target) => {
      const element = screen.queryByTestId(target)!;
      expect(element).toBeVisible();
    });
  });

  it('when unauthorized and parteng-hide-unauthorised is false it should change opacity and disable the click', async () => {
    const { fixture } = await renderDirective('update', 'projects', false);
    fixture.detectChanges();

    targets.forEach((target) => {
      const element = screen.queryByTestId(target)!;
      expect(element).toBeVisible();

      const style = window.getComputedStyle(element);
      expect(style.opacity).toBe('0.35');
      fireEvent.click(element);
      fixture.detectChanges();
      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  it('when unauthorised parteng-hide-unauthorised is true it should not be displayed', async () => {
    const { fixture } = await renderDirective('update', 'projects', true);
    fixture.detectChanges();

    targets.forEach((target) => {
      const element = screen.queryByTestId(target)!;
      expect(element).not.toBeVisible();
    });
  });

  it('when authorized it should let opacity and keep the click', async () => {
    const { fixture } = await renderDirective('read', 'projects', false);
    fixture.detectChanges();

    targets.forEach((target, index) => {
      const element = screen.queryByTestId(target)!;
      expect(element).toBeVisible();

      const style = window.getComputedStyle(element);
      expect(style.opacity).toBe('1');
      fireEvent.click(element);
      fixture.detectChanges();
      expect(clickSpy).toHaveBeenCalledTimes(index + 1);
    });
  });
});
