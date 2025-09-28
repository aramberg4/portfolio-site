import React from 'react';
import { Switch, Route } from 'react-router-dom';
import LandingPage from './sections/LandingPage';
import AboutMe from './sections/AboutMe';
import Projects from './sections/Projects';
import NFLTargetShare from './NFLTargetShare';

const Main = () => (
    <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/aboutme" component={AboutMe} />
        <Route exact path="/projects" component={Projects} />
        <Route exact path="/nfl-target-share" component={NFLTargetShare} />
    </Switch>
);

export default Main;