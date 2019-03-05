import {
    createReducer,
    createAction
} from 'redux-starter-kit';

export const setConfirmations = createAction('setConfirmations');

export const confirmationsReducer = createReducer([], {
    [ setConfirmations ]: (state, { payload }) => (
        payload.length && payload.map(({ confirmation }) => (
            confirmation
        ))
    )
});
