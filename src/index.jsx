import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { RecoilRoot } from 'recoil';

import { HashRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import Layout from './components/Layout.jsx';


import { LOG } from './pages/LOG.jsx';



import { Gamma } from './pages/Gamma.jsx';
import { Pattern } from './pages/Pattern.jsx';
import { ViewAngle } from './pages/ViewAngle.jsx';
import { Readability } from './pages/Readability.jsx';
import { ColorRatio } from './pages/ColorRatio.jsx';
import { LightLeak } from './pages/LightLeak.jsx';
import { ContrastRatio } from './pages/ContrastRatio.jsx';
import { SubWindow1 } from './pages/SubWindow1.jsx';


import { PatternSubWindow } from './pages/PatternSubWindow.jsx';
import { ViewAngleSubWindow } from './pages/ViewAngleSubWindow.jsx';
import { ReadabilitySubWindow } from './pages/ReadabilitySubWindow.jsx';
import { ColorRatioSubWindow } from './pages/ColorRatioSubWindow.jsx';
import { LightLeakSubWindow } from './pages/LightLeakSubWindow.jsx';
import { ContrastRatioSubWindow } from './pages/ContrastRatioSubWindow.jsx';
import { Aspice } from './pages/Aspice.jsx';
import {AspiceSubWindow} from './pages/AspiceSubWindow.jsx';


//const root = createRoot(document.body);
const container = document.getElementById('root');
const root = createRoot(container); 
// root.render(<App />);
root.render(
  <RecoilRoot>
    <HashRouter>
      <Routes>

        <Route path="/aspicesubwindow" element={<AspiceSubWindow />} />
        <Route path="/patternsubwindow" element={<PatternSubWindow />} />
        <Route path="/viewanglesubwindow" element={<ViewAngleSubWindow />} />
        <Route path="/readabilitysubwindow" element={<ReadabilitySubWindow />} />
        <Route path="/colorratiosubwindow" element={<ColorRatioSubWindow />} />
        <Route path="/lightleaksubwindow" element={<LightLeakSubWindow />} />
        <Route path="/contrastratiosubwindow" element={<ContrastRatioSubWindow />} />
        <Route path="/subwindow1" element={<SubWindow1 />} />
        <Route path="/" element={<Layout />}>
          {/* <Route path="alarm" element={<Alarm />} /> */}
          
          
          <Route path="log" element={<LOG />} />
          <Route path="test/manual/pattern" element={<Pattern />} />
          <Route path="/test/auto/pattern/gamma" element={<Gamma />} />
          <Route path="test/manual/viewangle" element={<ViewAngle />} />
          <Route path="test/manual/readability" element={<Readability />} />
          <Route path="test/manual/colorratio" element={<ColorRatio />} />
          <Route path="test/manual/lightleak" element={<LightLeak />} />
          <Route path="test/manual/contrastratio" element={<ContrastRatio />} />
          <Route path="test/manual/aspice" element={<Aspice />} />

          <Route path="*" element={<h1></h1>} />
        </Route>
      </Routes>
    </HashRouter>
  </RecoilRoot>
);
