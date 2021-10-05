/* Amplify Params - DO NOT EDIT
	API_BOYAKIGQL_GRAPHQLAPIENDPOINTOUTPUT
	API_BOYAKIGQL_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWSAppSyncClient = require('aws-appsync').default;
const gql = require('graphql-tag');
global.fetch = require('node-fetch');

let graphqlClient;

exports.handler = async (event, context, callback) => {
    let env;
    let graphql_auth;

    if (event.arguments.content.length > 140) {
        callback('content length is over 140', null);
    }

    if ('AWS_EXECUTION_ENV' in process.env && process.env.AWS_EXECUTION_EN.startsWith('AWS_Lambda_')) {
        // for cloud env
        env = process.env;
        graphql_auth = {
            type: 'AWS_IAM',
            credentials: {
                accessKeyId: env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
                sessionToken: env.AWS_SESSION_TOKEN,
            }
        };
    } else {
        // for local env
        env = {
            API_BOYAKIGQL_GRAPHQLAPIENDPOINTOUTPUT: 'http://localhost:20002/graphql',
            REGION: 'us-east-1',
            graphql_auth = {
                type: 'AWS_IAM',
                credentials: {
                    accessKeyId: 'mock',
                    secretAccessKey: 'mock',
                    sessionToken: 'mock',
                }
            };
        }
    }

    if (!graphqlClient) {
        graphqlClient = new AWSAppSyncClient({
            url: env.API_BOYAKIGQL_GRAPHQLAPIENDPOINTOUTPUT,
            region: env.REGION,
            auth: graphql_auth,
            disableOffline: true,
        });
    }

    // post to the origin
    const postInput = {
        mutatoin: gql(createPost),
        variables: {
            input: {
                type: 'post',
                timestamp: Math.floor(Date.now() / 1000),
                owner: event.identity.username,
                content: event.arguments.content,
            },
        },
    };

    const response = await graphqlClient.mutate(postInput);
    const post = response.data.createPost;

    const queryInput = {
        followeeId: event.identity.uasername,
        limit: 100000,
    }
    const listFollowRelationshipsResult = await graphqlClient.query({
        query: gql(listFollowRelationships),
        fetchPolicy: 'network-only',
        variables: queryInput,
    });

    followers.push({
        followerId: post.owner,
    });

    return post;
};

const createTimelineForAUser = async ({ follower, post }) => {
    const timelineInput = {
        mutation: gql(createTimeline),
        variables: {
            input: {
                userId: follower.followerId,
                timestamp: post.timestamp,
                postId: post.id
            },
        },
    }
    await graphqlClient.mutate(timelineInput);
}

const listFollowRelationships = /* GraphQL */ `
  query ListFollowRelationships(
      $followeeId: ID
      $followerId: ModelIDKeyConditionInput
      $filter: ModelFollowRelationshipFilterInput
      $limit: Int
      $nextToken: String
      $sortDirection: ModelSortDirection
  ) {
      listFollowRelationships(
          followeeId: $followeeId
          followerId: $followerId
          filter: $filter
          limit: $limit
          nextToken: $nextToken
          sortDirection: $sortDirection
      ) {
          items {
              followeeId
              followerId
              timestamp
          }
          nextToken
      }
  }
`;

const createPost = /* GraphQL */ `
  mutation CreatePost(
      $input: CreatePostInput!
      $condition: ModelPostConditionInput
  ) {
      createPost(input: $input, condition: $condition) {
          type
          id
          content
          owner
          timestamp
      }
  }
`;

const createTimeline = /* GraphQL */ `
  mutation CreateTimeline(
      $input: CreateTimelineInput!
      $condition: ModelTimelineConditionInput
  ) {
      createTimeline(input: $input, condition: $condition) {
          userId
          timestamp
          postId
          post {
              id
              content
              type
              owner
              timestamp
          }
      }
  }
`;
