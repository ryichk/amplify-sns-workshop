export const reducer = (state, action) => {
  switch (action.type) {
    case 'INITIAL_QUERY':
      return action.posts;
    case 'ADDITIONAL_QUERY':
      return [...state, ...action.posts];
    case 'SUBSCRIPTION':
      return [action.post, ...state];
    default:
      return state;
  }
};
