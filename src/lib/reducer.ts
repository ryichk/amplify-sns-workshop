import { Reducer } from 'react';
import { ActionType, ReducerState, ReducerAction } from '../interfaces';

export const reducer: Reducer<ReducerState, ReducerAction> = (state: ReducerState, action: ReducerAction) => {
  switch (action.type) {
    case ActionType.INITIAL_QUERY:
      return action.posts;
    case ActionType.ADDITIONAL_QUERY:
      return [...(state || []), ...(action.posts || [])];
    case ActionType.SUBSCRIPTION:
      return [action.post, ...(state || [])];
    default:
      return state;
  }
};
