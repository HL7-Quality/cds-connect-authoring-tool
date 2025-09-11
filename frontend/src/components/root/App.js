import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { getCurrentUser } from 'actions/auth';

import { Analytics, Navbar } from 'components/base';
import CdsHeader from 'components/header/CdsHeader';

const App = ({ children }) => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('login') === 'success') {
      // OAuth login was successful, refresh user data
      dispatch(getCurrentUser());
    }
  }, [location, dispatch]);

  return (
    <div className="app">
      <a className="skiplink" href="#maincontent">
        Skip to main content
      </a>
      <Analytics gtmKey={process.env.REACT_APP_GTM_KEY} dapURL={process.env.REACT_APP_DAP_URL} />
      {/* <AhrqHeader /> */}
      <CdsHeader />
      <Navbar isAuthenticated={isAuthenticated} />
      {children}
      {/* <CdsFooter /> */}
      {/* <AhrqFooter /> */}
    </div>
  );
};

export default App;
