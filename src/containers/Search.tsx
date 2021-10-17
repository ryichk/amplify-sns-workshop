import React, { useState, useReducer } from 'react';

import { API, graphqlOperation } from 'aws-amplify';

import { Button, TextField } from '@mui/material';

import PostList from '../components/PostList';
import Sidebar from './Sidebar';

import reducer from '../lib/reducer';
import { ActionType } from '../interfaces';

export const searchPostsGql = /* GraphQL */ `
  query SearchPosts(
    $filter: SearchablePostFilterInput
    $sort: SearchablePostSortInput
    $limit: Int
    $nextToken: String
  ) {
    searchPosts(filter: $filter, sort: $sort, limit: $limit, nextToken: $nextToken) {
      items {
        type
        id
        content
        owner
      }
      nextToken
      total
    }
  }
`;

const Search: React.FC = () => {
  const [posts, dispatch] = useReducer(reducer, []);
  const [nextToken, setNextToken] = useState<string | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');

  const searchPosts = async (type: ActionType, _nextToken: string | null | undefined = null) => {
    if (query === '') return;

    try {
      const response = await API.graphql(
        graphqlOperation(searchPostsGql, {
          filter: { content: { matchPhrase: query } },
          limit: 20,
          nextToken: _nextToken,
        })
      );
      dispatch({ type, posts: response.data.searchPosts.items });
      setNextToken(response.data.searchPosts.nextToken);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getAdditionalPosts = () => {
    if (nextToken === null) return;

    searchPosts(ActionType.ADDITIONAL_QUERY, nextToken);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <>
      <Sidebar activeListItem="search" />
      <PostList
        isLoading={isLoading}
        posts={posts}
        getAdditionalPosts={getAdditionalPosts}
        listHeaderTitle="Search"
        listHeaderTitleButton={
          <>
            <TextField
              label="Enter Keywords"
              multiline
              maxRows="3"
              variant="filled"
              value={query}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                searchPosts(ActionType.INITIAL_QUERY);
              }}
              fullWidth
            >
              Search
            </Button>
          </>
        }
      />
    </>
  );
};

export default Search;
