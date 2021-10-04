import React, { useState } from 'react';

import makeStyles from '@mui/styles/makeStyles';
import {
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  ListItemIcon,
  Drawer,
} from '@mui/material';
import { Person as PersonIcon, Public as PublicIcon } from '@mui/icons-material';

import { Auth, API, graphqlOperation } from 'aws-amplify';

import { useHistory } from 'react-router';
import { createPost } from '../graphql/mutations';

const drawerWidth = 340;
const MAX_POST_CONTENT_LENGTH = 140;

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    postion: 'relative',
  },
  drawerPaper: {
    width: drawerWidth,
    postion: 'relative',
  },
  toolbar: theme.mixins.toolbar,
  textField: {
    width: drawerWidth,
  },
  list: {
    width: 300,
  },
}));

interface SidebarProps {
  activeListItem: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeListItem }) => {
  const classes = useStyles();
  const history = useHistory();

  const [value, setValue] = useState('');
  const [isError, setIsError] = useState(false);
  const [helperText, setHelperText] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    if (event.target.value.length > MAX_POST_CONTENT_LENGTH) {
      setIsError(true);
      setHelperText(`${MAX_POST_CONTENT_LENGTH - event.target.value.length}`);
    } else {
      setIsError(false);
      setHelperText('');
    }
  };

  const onPost = async () => {
    await API.graphql(
      graphqlOperation(createPost, {
        input: {
          type: 'post',
          content: value,
          timestamp: Math.floor(Date.now() / 1000),
        },
      })
    );

    setValue('');
  };

  const signOut = () => {
    Auth.signOut();
  };

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
    >
      <div className={classes.toolbar} />
      <List>
        <ListItem
          button
          selected={activeListItem === 'global-timeline'}
          onClick={() => {
            Auth.currentAuthenticatedUser().then(() => {
              history.push('/global-timeline');
            });
          }}
          key="global-timeline"
        >
          <ListItemIcon>
            <PublicIcon />
          </ListItemIcon>
          <ListItemText primary="Global Timeline" />
        </ListItem>
        <ListItem
          button
          selected={activeListItem === 'profile'}
          onClick={() => {
            Auth.currentAuthenticatedUser().then((user) => {
              history.push(`/${user.username}`);
            });
          }}
          key="profile"
        >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem key="post-input-field">
          <ListItemText
            primary={
              <TextField
                error={isError}
                helperText={helperText}
                id="post-input"
                label="Type your post"
                multiline
                maxRows="8"
                variant="filled"
                value={value}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            }
          />
        </ListItem>
        <ListItem key="post-button">
          <ListItemText
            primary={
              <Button
                variant="contained"
                color="primary"
                disabled={isError}
                onClick={onPost}
                fullWidth
              >
                Post
              </Button>
            }
          />
        </ListItem>
        <ListItem key="logout">
          <ListItemText
            primary={
              <Button variant="outlined" onClick={signOut} fullWidth>
                Logout
              </Button>
            }
          />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
