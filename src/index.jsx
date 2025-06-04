import * as React from 'react';
import { createRoot } from 'react-dom/client';
// 🟰 RecoilRoot 가져오기 추가!
import { RecoilRoot } from 'recoil';
import App from './App.jsx';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import Layout from './components/Layout.jsx';
import { Alarm } from './pages/Alarm.jsx';
import { Serdes } from './pages/Serdes.jsx';
import { USB } from './pages/USB.jsx';
import { LOG } from './pages/LOG.jsx';
import { ADC } from './pages/ADCLog.jsx';
import { Pattern } from './pages/Pattern.jsx';
import { ViewAngle } from './pages/ViewAngle.jsx';
import { Readability } from './pages/Readability.jsx';
import { ColorRatio } from './pages/ColorRatio.jsx';
import { LightLeak } from './pages/LightLeak.jsx';
import { ContrastRatio } from './pages/ContrastRatio.jsx';
import { AlarmCRC } from './pages/AlarmCRC.jsx';
// Sub Window 에 대해서 이 아래에다 작성하자!
import { SubWindow1 } from './pages/SubWindow1.jsx';

/*
       <Route path="test/manual/pattern" element={<Pattern />} />
        <Route path="test/manual/viewangle" element={<ViewAngle />} />
        <Route path="test/manual/readability" element={<Readability />} />
        <Route path="test/manual/colorratio" element={<ColorRatio />} />
        <Route path="test/manual/lightleak" element={<LightLeak />} />
        <Route path="test/manual/contrastratio" element={<ContrastRatio />} />

*/

// 위에 주석한 컴포넌트 이름에 SubPage를 붙여서  import { SubWindow1 } from './pages/SubWindow1.jsx'; 이런식 임포트
import { PatternSubWindow } from './pages/PatternSubWindow.jsx';
import { ViewAngleSubWindow } from './pages/ViewAngleSubWindow.jsx';
import { ReadabilitySubWindow } from './pages/ReadabilitySubWindow.jsx';
import { ColorRatioSubWindow } from './pages/ColorRatioSubWindow.jsx';
import { LightLeakSubWindow } from './pages/LightLeakSubWindow.jsx';
import { ContrastRatioSubWindow } from './pages/ContrastRatioSubWindow.jsx';
import { LifeCycleSubWindow } from './pages/LifeCycleSubWindow.jsx';

import { Monitoring } from './pages/Monitoring.jsx';
//const root = createRoot(document.body);
const container = document.getElementById('root'); // 올바른 컨테이너 선택
const root = createRoot(container); // createRoot를 root div에 적용
// root.render(<App />);
root.render(
  <RecoilRoot>
    <HashRouter>
      <Routes>
        {/* import { PatternSubWindow } from './pages/PatternSubWindow.jsx';
import { ViewAngleSubWindow } from './pages/ViewAngleSubWindow.jsx';
import { ReadabilitySubWindow } from './pages/ReadabilitySubWindow.jsx';
import { ColorRatioSubWindow } from './pages/ColorRatioSubWindow.jsx';
import { LightLeakSubWindow } from './pages/LightLeakSubWindow.jsx';
import { ContrastRatioSubWindow } from './pages/ContrastRatioSubWindow.jsx'; */}
        {/* d위주석에 대한 url 만들자 형식은 /컴포넌트 소문자  */}
        <Route path="/lifecyclesubwindow" element={<LifeCycleSubWindow />} />
        <Route path="/patternsubwindow" element={<PatternSubWindow />} />
        <Route path="/viewanglesubwindow" element={<ViewAngleSubWindow />} />
        <Route path="/readabilitysubwindow" element={<ReadabilitySubWindow />} />
        <Route path="/colorratiosubwindow" element={<ColorRatioSubWindow />} />
        <Route path="/lightleaksubwindow" element={<LightLeakSubWindow />} />
        <Route path="/contrastratiosubwindow" element={<ContrastRatioSubWindow />} />
        <Route path="/subwindow1" element={<SubWindow1 />} />
        <Route path="/" element={<Layout />}>
          {/* <Route path="alarm" element={<Alarm />} /> */}
          <Route path="serdes" element={<Serdes />} />
          <Route path="alarm" element={<Alarm />} />
          <Route path="usb" element={<USB />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="alarmcrc" element={<AlarmCRC />} />
          <Route path="adclog" element={<ADC />} />
          <Route path="log" element={<LOG />} />
          <Route path="test/manual/pattern" element={<Pattern />} />
          <Route path="test/manual/viewangle" element={<ViewAngle />} />
          <Route path="test/manual/readability" element={<Readability />} />
          <Route path="test/manual/colorratio" element={<ColorRatio />} />
          <Route path="test/manual/lightleak" element={<LightLeak />} />
          <Route path="test/manual/contrastratio" element={<ContrastRatio />} />

          <Route path="*" element={<h1></h1>} />
        </Route>
      </Routes>
    </HashRouter>
  </RecoilRoot>
);
