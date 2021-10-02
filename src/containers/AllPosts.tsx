import React, { useState, useEffect, useReducer } from 'react';

import { API, graphqlOperation } from 'aws-amplify';
import { GraphQLResult } from '@aws-amplify/api';

import { Observable } from 'zen-observable-ts';

import { listPostsSortedByTimestamp } from '../graphql/queries';
import { onCreatePost } from '../graphql/subscriptions';

import { PostList } from '../components/PostList';
import Sidebar from './Sidebar';

import { reducer } from '../lib/reducer';
import { Post, ActionType } from '../interfaces';

const AllPosts: React.FC = () => {
  const [posts, dispatch] = useReducer(reducer, []);
  const [nextToken, setNextToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getPosts = async (type: ActionType, nextToken = null) => {
    const response = (
      await API.graphql(graphqlOperation(listPostsSortedByTimestamp, {
      type: 'post',
      sortDirection: 'DESC',
      limit: 20,
      nextToken: nextToken,
    }))) as GraphQLResult<any>;
    console.log(response);
    dispatch({
      type: type,
      posts: response.data.listPostsSortedByTimestamp.items
    });
    setNextToken(response.data.listPostsSortedByTimestamp.nextToken);
    setIsLoading(false);
  }

  const getAdditionalPosts = () => {
    if (nextToken === null) return;
    getPosts(ActionType.ADDITIONAL_QUERY, nextToken);
  }

  useEffect(() => {
    getPosts(ActionType.INITIAL_QUERY);

    const subscription = (API.graphql(graphqlOperation(onCreatePost)) as Observable<any>).subscribe({
      next: (message) => {
        console.log('allposts subscription fired');
        const post = message.value.data.onCreatePost as Post;
        dispatch({
          type: ActionType.SUBSCRIPTION,
          post: post
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Sidebar
        activeListItem='global-timeline'
      />
      <PostList
        isLoading={isLoading}
        posts={posts}
        getAdditionalPosts={getAdditionalPosts}
        listHeaderTitle={'Global Timeline'}
      />
    </>
  )
}

export default AllPosts;
