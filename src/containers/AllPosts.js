import React, { useState, useEffect, useReducer } from 'react';

import { API, graphqlOperation } from 'aws-amplify';

import { listPostsSortedByTimestamp } from '../graphql/queries';
import { onCreatePost } from '../graphql/subscriptions';

import PostList from '../components/PostList';
import Sidebar from './Sidebar';

const SUBSCRIPTION = 'SUBSCRIPTION';
const INITIAL_QUERY = 'INITIAL_QUERY';
const ADDITIONAL_QUERY = 'ADDITIONAL_QUERY';

const reducer = (state, action) => {
  switch (action.type) {
    case INITIAL_QUERY:
      return action.posts;
    case ADDITIONAL_QUERY:
      return [...state, ...action.posts];
    case SUBSCRIPTION:
      return [action.post, ...state];
    default:
      return state;
  }
};

export default function AllPosts() {
  const [posts, dispatch] = useReducer(reducer, []);
  const [nextToken, setNextToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getPosts = async (type, nextToken = null) => {
    const response = await API.graphql(graphqlOperation(listPostsSortedByTimestamp, {
      type: 'post',
      sortDirection: 'DESC',
      limit: 20,
      nextToken: nextToken,
    }));
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
    getPosts(ADDITIONAL_QUERY, nextToken);
  }

  useEffect(() => {
    getPosts(INITIAL_QUERY);

    const subscription = API.graphql(graphqlOperation(onCreatePost)).subscribe({
      next: (message) => {
        console.log('allposts subscription fired');
        const post = message.value.data.onCreatePost;
        dispatch({
          post: post,
          type: SUBSCRIPTION
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
        listHelperTitle={'Global Timeline'}
      />
    </>
  )
}
