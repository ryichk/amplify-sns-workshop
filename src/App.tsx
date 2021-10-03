import React, { useState, useEffect } from 'react';
import Amplify from 'aws-amplify';
import { AmplifyAuthenticator, AmplifySignUp } from '@aws-amplify/ui-react';
import { AuthState, CognitoUserInterface, onAuthUIStateChange } from '@aws-amplify/ui-components';

import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';

import { createTheme, ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import CssBaseline from '@mui/material/CssBaseline';
import awsconfig from './aws-exports.js';

import AllPosts from './containers/AllPosts';
import PostsBySpecifiedUser from './containers/PostsBySpecifiedUser';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

Amplify.configure(awsconfig);

const drawerWidth = 240;

// eslint-disable-next-line
const theme = (createTheme as any)({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1EA1F2',
      contrastText: '#fff',
    },
    background: {
      default: '#15202B',
      paper: '#15202B',
    },
    divider: '#37444C',
  },
  overrides: {
    MuiButton: {
      color: 'white',
    },
  },
  typography: {
    fontFamily: ['Arial'].join(','),
  },
  status: {
    danger: 'orange',
  },
});

const useStyles = makeStyles((_theme) => ({
  root: {
    display: 'flex',
    height: '100%',
    width: 800,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  appBar: {
    marginLeft: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  toolbar: _theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: _theme.palette.background.default,
    padding: _theme.spacing(3),
  },
}));

function Component() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <CssBaseline />
      <HashRouter>
        <Switch>
          <Route exact path="/" component={AllPosts} />
          <Route exact path="/global-timeline" component={AllPosts} />
          <Route exact path="/:userId" component={PostsBySpecifiedUser} />
          <Redirect path="*" to="/" />
        </Switch>
      </HashRouter>
    </div>
  );
}

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>();
  const [user, setUser] = useState<CognitoUserInterface>();

  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData as CognitoUserInterface);
    });
  }, []);

  return authState === AuthState.SignedIn && user ? (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <Component />
      </ThemeProvider>
    </StyledEngineProvider>
  ) : (
    <AmplifyAuthenticator>
      <AmplifySignUp
        slot="sign-up"
        formFields={[{ type: 'username' }, { type: 'password' }, { type: 'email' }]}
      />
    </AmplifyAuthenticator>
  );
};

export default App;
