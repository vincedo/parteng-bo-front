import * as fromReducer from './project-form.reducers';
import * as fromActions from './project-form.actions';

describe('State.dialogScopeSelector', () => {
  //
  // ----- Reducers -----
  //
  describe('----- Reducers -----', () => {
    describe('unknown action', () => {
      test('should return the default state', () => {
        const { initialState } = fromReducer;
        const action = {
          type: 'Unknown',
        };
        const state = fromReducer.reducer(initialState, action);

        expect(state).toBe(initialState);
      });
    });

    // describe('retrievedBookList action', () => {
    //   it('should retrieve all books and update the state in an immutable way', () => {
    //     const { initialState } = fromReducer;
    //     const state: fromReducer.State = { ...initialState };
    //     const action = fromActions.openDialogScopeSelectorFromProjectPage();
    //     const state = fromReducer.reducer(initialState, action);

    //     expect(state).toEqual(newState);
    //     expect(state).not.toBe(newState);
    //   });
    // });
  });

  //
  // ----- Effects -----
  //
  describe('----- Effects -----', () => {});

  //
  // ----- Selectors -----
  //
  describe('----- Selectors -----', () => {});
});
