import React, { useState, useEffect, useReducer } from 'react';

import { API, graphqlOperation } from 'aws-amplify';
import { useParams } from 'react-router';

import { Observable } from 'zen-observable-ts';

import { listPostsBySpecificOwner } from '../graphql/queries';
import { onCreatePost } from '../graphql/subscriptions';

import PostList from '../components/PostList';
import Sidebar from './Sidebar';

import reducer from '../lib/reducer';
import { ActionType } from '../interfaces';
import { ListPostsBySpecificOwnerQuery } from '../API';

const PostsBySpecifiedUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  const [posts, dispatch] = useReducer(reducer, []);
  const [nextToken, setNextToken] = useState<string | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getPosts = async (type: ActionType, _nextToken: string | null | undefined = null) => {
    const response = await API.graphql(
      graphqlOperation(listPostsBySpecificOwner, {
        owner: userId,
        sortDirection: 'DESC',
        limit: 20,
        _nextToken,
      })
    );
    if ('data' in response && response.data) {
      const listPosts = response.data as ListPostsBySpecificOwnerQuery;
      if (listPosts.listPostsBySpecificOwner) {
        dispatch({ type, posts: listPosts.listPostsBySpecificOwner.items });
        setNextToken(listPosts.listPostsBySpecificOwner.nextToken);
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
          const post = data.onCreatePost;
          if (post.owner !== userId) return;
          dispatch({ type: ActionType.SUBSCRIPTION, post });
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
      <Sidebar activeListItem="profile" />
      <PostList
        isLoading={isLoading}
        posts={posts}
        getAdditionalPosts={getAdditionalPosts}
        listHeaderTitle={userId}
      />
    </>
  );
};

export default PostsBySpecifiedUser;
