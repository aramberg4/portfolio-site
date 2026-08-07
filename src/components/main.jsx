import React from 'react';
import { Switch, Route } from 'react-router-dom';
import LandingPage from './sections/LandingPage';
import AboutMe from './sections/AboutMe';
import Projects from './sections/Projects';
import Blog from './sections/Blog';
import NFLTargetShare from './NFLTargetShare';
import FantasyFootball from './FantasyFootball';
import Polywatch from './polywatch/Polywatch';
import OrchardRun from './orchardrun/OrchardRun';

const Main = () => (
    <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/aboutme" component={AboutMe} />
        <Route exact path="/projects" component={Projects} />
        <Route exact path="/blog" component={Blog} />
        <Route exact path="/nfl-target-share" component={NFLTargetShare} />
        <Route exact path="/fantasy-football" component={FantasyFootball} />
        <Route exact path="/polywatch" component={Polywatch} />
        {/* Unlisted — shared by direct link only */}
        <Route exact path="/austins-30th" component={OrchardRun} />
        {/* Same invite without the gift list, for guests who aren't expected to bring one */}
        <Route exact path="/orchard-day" render={() => <OrchardRun showGifts={false} />} />
    </Switch>
);

export default Main;