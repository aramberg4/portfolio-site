import React, { Component } from 'react';
import './App.css';
import {Layout, Header, Navigation, Drawer, Content } from 'react-mdl'
import Main from './components/main';
import { Link } from 'react-router-dom'
import Pdf from './resources/resumeFullNoPhone.pdf';

class App extends Component {
  hideToggle() {
    var selectorId = document.querySelector('.mdl-layout');
    selectorId.MaterialLayout.toggleDrawer();
  }

  render() {

    return (
      <div className="App">
        <div>
          <Layout drawerClickHandler={this.drawerToggleClickHandler} fixedHeader>
              <Header className="header" title={<Link to="/" style={{textDecoration: 'none', color: 'white'}}><i class="fa fa-bolt" aria-hidden="true"></i>  Austin Ramberg</Link>}>
                  <Navigation className="horizontal-nav">
                      <Link to = {Pdf} target = "_blank" className="nav-item">Resume</Link>
                      <Link to="/projects" className="nav-item">Projects</Link>
                      <Link to="/aboutme" className="nav-item">About</Link>
                  </Navigation>
              </Header>
              <Drawer className="header-drawer" title="Austin Ramberg">
                  <Navigation>
                    <Link to="/" onClick={() => this.hideToggle()}>Home</Link>
                    <Link to = {Pdf} target = "_blank" onClick={() => this.hideToggle()}>Resume</Link>
                    <Link to="/projects" onClick={() => this.hideToggle()}>Projects</Link>
                    <Link to="/aboutme" onClick={() => this.hideToggle()}>About</Link>
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
}

export default App;
