import React from 'react';
import './App.css';
import {Layout, Header, Navigation, Drawer, Content} from 'react-mdl'
import Main from './components/main';
import { Link } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <div style={{height: '300px', position: 'relative'}}>
        <Layout fixedHeader>
            <Header className="header-color" title={<Link to="/"><strong>Austin Ramberg</strong></Link>}>
                <Navigation>
                    <Link to="/resume">Resume</Link>
                    <Link to="/projects">Projects</Link>
                    <Link to="/aboutme">About</Link>
                    <Link to="/contact">Contact</Link>
                </Navigation>
            </Header>
            <Drawer className="header-drawer" title="Title">
                <Navigation>
                  <Link to="/resume">Resume</Link>
                  <Link to="/projects">Projects</Link>
                  <Link to="/aboutme">About</Link>
                  <Link to="/contact">Contact</Link>
                </Navigation>
            </Drawer>
            <Content>
              <div className="page-content" />
              <Main/>
            </Content>
        </Layout>
      </div>
    </div>
  );
}

export default App;
