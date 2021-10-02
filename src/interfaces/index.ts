export type Diff = 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds';

export interface Post {
  id: number;
  owner: string;
  timestamp: number;
  content: string;
}

export type Posts = Array<Post | undefined> | null | undefined;

export interface PostItemProps {
  post: Post | undefined;
}

export interface PostListProps {
  isLoading: boolean;
  posts: Posts
  getAdditionalPosts: Function;
  listHeaderTitle: string;
}

export enum ActionType {
  INITIAL_QUERY = 'INITIAL_QUERY',
  ADDITIONAL_QUERY = 'ADDITIONAL_QUERY',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export type ReducerState = Posts;

export interface ReducerAction {
  type: ActionType;
  post?: Post | undefined;
  posts?: Posts;
}
