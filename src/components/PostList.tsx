import React from 'react';

import makeStyles from '@mui/styles/makeStyles';
import {
  Button,
  List,
  ListItem,
  Divider,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  CircularProgress,
} from '@mui/material';

import { useHistory } from 'react-router';
import moment from 'moment';

import { Diff, Post, PostItemProps, PostListProps } from '../interfaces';

const useStyles = makeStyles(() => ({
  listRoot: {
    width: '100%',
    wordBreak: 'break-all',
    overflow: 'scroll',
    borderRight: '1px solid #37444C',
  },
  alignCenter: {
    textAlign: 'center',
  },
  loader: {
    textAlign: 'center',
    paddingTop: 20,
  },
  maxWidth: {
    width: '100%',
  },
  listHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 1200,
    backgroundColor: '#15202B',
    borderBottom: '1px solid #37444C',
  },
  clickable: {
    cursor: 'pointer',
  },
}));

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const classes = useStyles();
  const history = useHistory();
  const now = moment();

  const calcTimestampDiff = (timestamp: number) => {
    const scales: Array<Diff> = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'];

    for (let i = 0; i < scales.length; i += 1) {
      const scale: Diff = scales[i];
      const diff = moment(now).diff(timestamp * 1000, scale);
      if (diff > 0) return diff + scale.charAt(0);
    }

    return 0 + scales[scales.length - 1].charAt(0);
  };

  return (
    <ListItem alignItems="flex-start" key={post?.id}>
      <ListItemAvatar>
        <button
          type="button"
          className={classes.clickable}
          onClick={() => history.push(`/${post?.owner}`)}
        >
          {post?.owner ? <Avatar alt={post?.owner} src="/" /> : <Avatar src="/" />}
        </button>
      </ListItemAvatar>
      <ListItemText
        primary={
          <>
            {post?.owner}
            <Typography color="textSecondary" display="inline">
              {` ${String.fromCharCode(183)} ${calcTimestampDiff(
                post?.timestamp ? post.timestamp : 0
              )}`}
            </Typography>
          </>
        }
        secondary={<Typography color="textPrimary">{post?.content}</Typography>}
      />
    </ListItem>
  );
};

const PostList: React.FC<PostListProps> = ({
  isLoading,
  posts,
  getAdditionalPosts,
  listHeaderTitle,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.listRoot}>
      {isLoading ? (
        <div className={classes.loader}>
          <CircularProgress size={25} />
        </div>
      ) : (
        <List disablePadding>
          <ListItem alignItems="flex-start" className={classes.listHeader}>
            <Typography variant="h5">{listHeaderTitle}</Typography>
          </ListItem>
          {posts?.map((post: Post) => {
            return (
              <span>
                <PostItem post={post} />
                <Divider component="li" />
              </span>
            );
          })}
          <ListItem alignItems="flex-start" className={classes.alignCenter} key="loadmore">
            <ListItemText
              primary={
                <Button
                  variant="outlined"
                  onClick={() => getAdditionalPosts()}
                  className={classes.maxWidth}
                >
                  Read More
                </Button>
              }
            />
          </ListItem>
        </List>
      )}
    </div>
  );
};

export default PostList;
