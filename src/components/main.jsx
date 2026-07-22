import React from 'react';
import { Switch, Route } from 'react-router-dom';
import LandingPage from './sections/LandingPage';
import AboutMe from './sections/AboutMe';
import Projects from './sections/Projects';
import NFLTargetShare from './NFLTargetShare';
import FantasyFootball from './FantasyFootball';
import Polywatch from './polywatch/Polywatch';

const Main = () => (
    <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/aboutme" component={AboutMe} />
        <Route exact path="/projects" component={Projects} />
        <Route exact path="/nfl-target-share" component={NFLTargetShare} />
        <Route exact path="/fantasy-football" component={FantasyFootball} />
        <Route exact path="/polywatch" component={Polywatch} />
    </Switch>
);

export default Main;