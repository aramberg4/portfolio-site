import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './sections/LandingPage';
import AboutMe from './sections/AboutMe';
import Projects from './sections/Projects';
import Blog from './sections/Blog';
import NFLTargetShare from './NFLTargetShare';
import FantasyFootball from './FantasyFootball';
import Polywatch from './polywatch/Polywatch';
import OrchardRun from './orchardrun/OrchardRun';

const Main = () => (
    <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/aboutme" element={<AboutMe />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/nfl-target-share" element={<NFLTargetShare />} />
        <Route path="/fantasy-football" element={<FantasyFootball />} />
        <Route path="/polywatch" element={<Polywatch />} />
        {/* Unlisted — shared by direct link only */}
        <Route path="/austins-30th" element={<OrchardRun />} />
        {/* Same invite without the gift list, for guests who aren't expected to bring one */}
        <Route path="/orchard-day" element={<OrchardRun showGifts={false} />} />
    </Routes>
);

export default Main;
