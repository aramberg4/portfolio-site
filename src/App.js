import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Main from './components/main';

function App() {
  return (
    <Router>
      <Layout>
        <Main />
      </Layout>
    </Router>
  );
}

export default App;
