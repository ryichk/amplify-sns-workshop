import React, { useState, useEffect, useReducer } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { Observable } from 'zen-observable-ts';

import { listPostsSortedByTimestamp } from '../graphql/queries';
import { onCreatePost } from '../graphql/subscriptions';

import PostList from '../components/PostList';
import Sidebar from './Sidebar';

import reducer from '../lib/reducer';
import { Post, ActionType } from '../interfaces';
import { ListPostsSortedByTimestampQuery } from '../API';

const AllPosts: React.FC = () => {
  const [posts, dispatch] = useReducer(reducer, []);
  const [nextToken, setNextToken] = useState<string | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getPosts = async (type: ActionType, _nextToken: string | null | undefined = null) => {
    const response = await API.graphql(
      graphqlOperation(listPostsSortedByTimestamp, {
        type: 'post',
        sortDirection: 'DESC',
        limit: 20,
        _nextToken,
      })
    );
    if ('data' in response && response.data) {
      const listPosts = response.data as ListPostsSortedByTimestampQuery;
      if (listPosts.listPostsSortedByTimestamp) {
        dispatch({
          type,
          posts: listPosts.listPostsSortedByTimestamp.items,
        });
        setNextToken(listPosts.listPostsSortedByTimestamp.nextToken);
        setIsLoading(false);
      }
    }
  };

  const getAdditionalPosts = () => {
    if (nextToken === null) return;
    getPosts(ActionType.ADDITIONAL_QUERY, nextToken);
  };

  useEffect(() => {
    getPosts(ActionType.INITIAL_QUERY);

    let unsubscribe;
    const subscription = API.graphql(graphqlOperation(onCreatePost));
    if (subscription instanceof Observable) {
      const sub = subscription.subscribe({
        next: ({ value: { data } }) => {
          const post = data.onCreatePost as Post;
          dispatch({
            type: ActionType.SUBSCRIPTION,
            post,
          });
        },
      });
      unsubscribe = () => {
        sub.unsubscribe();
      };
    }
    return unsubscribe;
  }, []);

  return (
    <>
      <Sidebar activeListItem="global-timeline" />
      <PostList
        isLoading={isLoading}
        posts={posts}
        getAdditionalPosts={getAdditionalPosts}
        listHeaderTitle="Global Timeline"
      />
    </>
  );
};

export default AllPosts;
