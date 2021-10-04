export type Diff = 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds';

export type Post =
  | {
      __typename: 'Post';
      type: string;
      id?: string | null | undefined;
      content: string;
      owner?: string | null | undefined;
      timestamp: number;
    }
  | null
  | undefined;

export type Posts = (Post | null)[] | null | undefined;

export interface PostItemProps {
  post: Post | undefined;
}

export interface PostListProps {
  isLoading: boolean;
  posts: Posts;
  getAdditionalPosts: () => void;
  listHeaderTitle: string;
}

export const ActionType = {
  INITIAL_QUERY: 'INITIAL_QUERY',
  ADDITIONAL_QUERY: 'ADDITIONAL_QUERY',
  SUBSCRIPTION: 'SUBSCRIPTION',
};
export type ActionType = typeof ActionType[keyof typeof ActionType];

export type ReducerState = Posts;

export interface ReducerAction {
  type: ActionType;
  post?: Post | undefined;
  posts?: Posts;
}
