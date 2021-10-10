import React, { useState, useEffect, useReducer } from 'react';

import { Auth, API, graphqlOperation } from 'aws-amplify';
import { CognitoUserInterface } from '@aws-amplify/ui-components';
import { useParams } from 'react-router';

import { Button } from '@mui/material';

import { listPostsBySpecificOwner, getFollowRelationship } from '../graphql/queries';
import { onCreatePost } from '../graphql/subscriptions';
import { createFollowRelationship, deleteFollowRelationship } from '../graphql/mutations';

import PostList from '../components/PostList';
import Sidebar from './Sidebar';

import reducer from '../lib/reducer';
import { ActionType, OnCreatePostSubscriptionMsg } from '../interfaces';
import { ListPostsBySpecificOwnerQuery } from '../API';

const PostsBySpecifiedUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  const [posts, dispatch] = useReducer(reducer, []);
  const [nextToken, setNextToken] = useState<string | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CognitoUserInterface>();
  const [isFollowing, setIsFollowing] = useState(false);

  const getPosts = async (type: ActionType, _nextToken: string | null | undefined = null) => {
    const response = await API.graphql(
      graphqlOperation(listPostsBySpecificOwner, {
        owner: userId,
        sortDirection: 'DESC',
        limit: 20,
        nextToken: _nextToken,
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

  const getIsFollowing = async (followerId: string, followeeId: string) => {
    const response = await API.graphql(
      graphqlOperation(getFollowRelationship, {
        followeeId,
        followerId,
      })
    );
    return response.data.getFollowRelationship !== null;
  };

  const getAdditionalPosts = () => {
    if (nextToken === null) return;
    getPosts(ActionType.ADDITIONAL_QUERY, nextToken);
  };

  const follow = async () => {
    const input = {
      followeeId: userId,
      followerId: currentUser?.username,
      timestamp: Math.floor(Date.now() / 1000),
    };
    const response = await API.graphql(
      graphqlOperation(createFollowRelationship, {
        input,
      })
    );
    if (!response.data.createFollowRelationship?.errors) setIsFollowing(true);
  };

  const unfollow = async () => {
    const input = {
      followeeId: userId,
      followerId: currentUser?.username,
    };
    const response = await API.graphql(graphqlOperation(deleteFollowRelationship, { input }));

    if (!response.data.deleteFollowRelationship?.errors) setIsFollowing(false);
  };

  useEffect(() => {
    const init = async () => {
      const currentAuthUser = await Auth.currentAuthenticatedUser();
      setCurrentUser(currentAuthUser);

      setIsFollowing(await getIsFollowing(userId, currentAuthUser.username));

      getPosts(ActionType.INITIAL_QUERY);
    };
    init();

    let unsubscribe;
    const subscription = API.graphql(graphqlOperation(onCreatePost));
    if ('subscribe' in subscription) {
      const sub = subscription.subscribe({
        next: (msg: OnCreatePostSubscriptionMsg) => {
          const {
            value: { data },
          } = msg;
          const post = data.onCreatePost;
          if (post?.owner !== userId) return;
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
        listHeaderTitleButton={
          currentUser &&
          userId !== currentUser.username &&
          (isFollowing ? (
            <Button variant="contained" color="primary" onClick={unfollow}>
              Following
            </Button>
          ) : (
            <Button variant="outlined" color="primary" onClick={follow}>
              Follow
            </Button>
          ))
        }
      />
    </>
  );
};

export default PostsBySpecifiedUser;
