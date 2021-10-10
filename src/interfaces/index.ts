import { OnCreatePostSubscription, OnCreateTimelineSubscription } from '../API';

export type DateTimeExpression =
  | 'years'
  | 'months'
  | 'weeks'
  | 'days'
  | 'hours'
  | 'minutes'
  | 'seconds';

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

export type Posts = Array<Post> | null | undefined;

export type Timeline =
  | {
      __typename: 'Timeline';
      userId: string;
      timestamp: number;
      postId: string;
      post?: Post;
    }
  | null
  | undefined;

export type Timelines = Array<Timeline> | null | undefined;
export interface ListTimelines {
  __typename: 'ModelTimelineConnection';
  items?: Timelines;
  nextToken?: string | null;
}

export interface PostItemProps {
  post: Post | undefined;
}

export interface PostListProps {
  isLoading: boolean;
  posts: Posts;
  getAdditionalPosts: () => void;
  listHeaderTitle: string;
  listHeaderTitleButton?: false | JSX.Element | undefined;
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

export interface OnCreatePostSubscriptionMsg {
  value: { data: OnCreatePostSubscription };
}

export interface OnCreateTimelineSubscriptionMsg {
  value: { data: OnCreateTimelineSubscription };
}
