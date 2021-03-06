import React, { useState, useEffect, useReducer } from 'react';

import { Auth, API, graphqlOperation } from 'aws-amplify';
import { CognitoUserInterface } from '@aws-amplify/ui-components';

import { listTimelines } from '../graphql/queries';
import { onCreateTimeline } from '../graphql/subscriptions';

import PostList from '../components/PostList';
import Sidebar from './Sidebar';

import reducer from '../lib/reducer';
import { Post, ListTimelines, ActionType, OnCreateTimelineSubscriptionMsg } from '../interfaces';

const Timeline: React.FC = () => {
  const [posts, dispatch] = useReducer(reducer, []);
  const [nextToken, setNextToken] = useState<string | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CognitoUserInterface | null>(null);

  const getPosts = async (
    type: ActionType,
    _currentUser: CognitoUserInterface | null,
    _nextToken: string | null | undefined = null
  ) => {
    try {
      const response = await API.graphql(
        graphqlOperation(listTimelines, {
          userId: _currentUser?.username,
          sortDirection: 'DESC',
          limit: 20,
          nextToken: _nextToken,
        })
      );
      if ('data' in response && response.data) {
        const listTimelinesData = response.data.listTimelines as ListTimelines;
        if (listTimelinesData.items) {
          dispatch({
            type,
            posts: listTimelinesData.items.map((item) => item?.post) as Array<Post>,
          });
          setNextToken(listTimelinesData.nextToken);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAdditionalPosts = () => {
    if (nextToken === null) return;
    getPosts(ActionType.ADDITIONAL_QUERY, currentUser, nextToken);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const currentAuthUser = await Auth.currentAuthenticatedUser();
        setCurrentUser(currentAuthUser);
        getPosts(ActionType.INITIAL_QUERY, currentAuthUser);
      } catch (error) {
        console.log(error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    let unsubscribe;
    if (!currentUser) return unsubscribe;

    const subscription = API.graphql(
      graphqlOperation(onCreateTimeline, {
        userId: currentUser.username,
      })
    );
    if ('subscribe' in subscription) {
      const sub = subscription.subscribe({
        next: (msg: OnCreateTimelineSubscriptionMsg) => {
          const {
            value: { data },
          } = msg;
          dispatch({ type: ActionType.SUBSCRIPTION, post: data.onCreateTimeline?.post });
        },
      });
      unsubscribe = () => {
        sub.unsubscribe();
      };
    }
    return unsubscribe;
  }, [currentUser]);

  return (
    <>
      <Sidebar activeListItem="Home" />
      <PostList
        isLoading={isLoading}
        posts={posts}
        getAdditionalPosts={getAdditionalPosts}
        listHeaderTitle="Home"
      />
    </>
  );
};

export default Timeline;
