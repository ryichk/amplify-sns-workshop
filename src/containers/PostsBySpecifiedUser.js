import React, { useState, useEffect, useReducer } from 'react';

import { API, graphqlOperation } from 'aws-amplify';
import { useParams } from 'react-router';

import { listPostsBySpecificOwner } from '../graphql/queries';
import { onCreatePost } from '../graphql/subscriptions';

import PostList from '../components/PostList';
import Sidebar from './Sidebar';

import { reducer } from '../lib/reducer';

export default function PostsBySpecifiedUser() {
  const { userId } = useParams();

  const [posts, dispatch] = useReducer(reducer, []);
  const [nextToken, setNextToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getPosts = async (type, nextToken = null) => {
    const response = await API.graphql(graphqlOperation(listPostsBySpecificOwner, {
      owner: userId,
      sortDirection: 'DESC',
      limit: 20,
      nextToken: nextToken,
    }));
    console.log(response);
    dispatch({ type: type, posts: response.data.listPostsBySpecificOwner.items });
    setNextToken(response.data.listPostsBySpecificOwner.nextToken);
    setIsLoading(false);
  }

  const getAdditionalPosts = () => {
    if (nextToken === null) return;
    getPosts('ADDITIONAL_QUERY', nextToken);
  }

  useEffect(() => {
    getPosts('INITIAL_QUERY');

    const subscription = API.graphql(graphqlOperation(onCreatePost)).subscribe({
      next: (message) => {
        const post = message.value.data.onCreatePost;
        if (post.owner !== userId) return;
        dispatch({ type: 'SUBSCRIPTION', post: post });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Sidebar
        activeListItem='profile'
      />
      <PostList
        isLoading={isLoading}
        posts={posts}
        getAdditionalPosts={getAdditionalPosts}
        listHeaderTitle={userId}
      />
    </>
  )
}
