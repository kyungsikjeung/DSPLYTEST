import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { listSerialPorts, connectSerial, closeSerialPort, hasCA410 } from '../apis/serial.js';

//  메뉴명 , 링크 관리
const links = [
 { path: '/log', label: '로그 모니터링&제어', subLinks: [] },
  { path: '/test/manual/viewangle', label: '시야각테스트' ,subLinks: [] },
  { path: '/test/manual/pattern', label: '색상비 테스트(선택)' ,subLinks: [] },
  { path: '/test/manual/colorratio', label: '색상비 테스트(입력)' ,subLinks: [] },
  { path: '/test/manual/aspice', label: '패턴 테스트' ,subLinks: [] },
  { path: '/test/manual/readability', label: '가독성 테스트' ,subLinks: [] },
  { path: '/test/manual/lightleak', label: '빛샘 멍 테스트' ,subLinks: [] },
  { path: '/test/auto/pattern/gamma', label: '감마 테스트' , subLinks: [] },
  { path: '/test/manual/contrastratio', label: '명암비테스트' ,subLinks: [] },
  // { path: '/test/auto/ser/viewangle', label: '시야각 테스트' , subLinks: [] },
  // { path: '/test/auto/des/contrast', label: '명암비 테스트' , subLinks: [] },
];

const Layout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serialPorts, setSerialPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState('');     // 선택된 시리얼 포트(문자열)
  const [isConnected, setIsConnected] = useState(false);    // 연결 상태
  const [disableButton, setDisableButton] = useState(true); // 버튼 비활성화 상태
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showX, setShowX] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  // Electron 환경 가드
  const ipc = typeof window !== 'undefined' && window.ipcRenderer ? window.ipcRenderer : null;

  // 폴링 stop 핸들 저장용
  const pollStopRef = useRef(null);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };
  const toggleMenu = (index) => {
    setOpenMenus(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // 안전 폴링: setTimeout 재귀 방식
  const startPolling = ({ intervalMs = 2000, maxTries = 30 } = {}) => {
    if (pollStopRef.current) return; // 중복 시작 방지

    let cancelled = false;
    let timer = null;

    const stop = () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      pollStopRef.current = null;
    };

    const run = async (attempt = 1) => {
      if (cancelled) return;
      try {
        const ok = await hasCA410();
        if (ok) {
          await connectCA410(); // 성공 시 내부에서 상태 세팅
          stop();
          return;
        }
      } catch (e) {
        console.error('Polling error:', e);
        // 에러도 1회 시도로 간주 (원하면 제외 가능)
      }
      if (attempt >= maxTries || cancelled) {
        stop();
        return;
      }
      timer = setTimeout(() => run(attempt + 1), intervalMs);
    };

    pollStopRef.current = stop;
    run();
  };

  const stopPolling = () => {
    if (pollStopRef.current) {
      pollStopRef.current(); // 내부 clearTimeout + ref 초기화
    }
  };

  // 연결 시도(연결되면 상태 업데이트, 포트 목록 반영)
  const connectCA410 = async () => {
    try {
      const data = await connectSerial();
      // 예시 응답:
      // {
      //   success: true,
      //   message: "Port opened successfully",
      //   portList: ["COM6","COM4","COM9"],
      //   selectedPort: "COM4"
      // }
      const ports = Array.isArray(data?.portList) ? data.portList : [];
      setSerialPorts(ports);
      setDisableButton(ports.length === 0);

      if (data?.success) {
        setIsConnected(true);
        setSelectedPort(data?.selectedPort || '');
        stopPolling();
      }
      return data;
    } catch (error) {
      console.error('시리얼 연결 시도 실패:', error);
      return { success: false, error };
    }
  };

  // 포트 선택 핸들러 (문자열 값)
  const handlePortSelect = (e) => {
    const port = e.target.value;
    setSelectedPort(port);
    setDisableButton(!port);
  };

  // 연결/해제 토글
  const toggleConnection = async () => {
    if (isConnected) {
      try {
        if (selectedPort) {
          await closeSerialPort({ portName: selectedPort });
        } else {
          // 선택 포트가 비어있다면 서버가 기억하는 현재 포트를 닫는 API가 필요할 수 있음
          await closeSerialPort({});
        }
        setIsConnected(false);
        // 연결 끊겼으니 폴링 시작
        startPolling();
      } catch (error) {
        console.error('Failed to disconnect:', error);
      }
    } else {
      // 재연결 시도 (선택 포트가 있어도 connectSerial이 내부에서 자동 선택한다면 그대로 사용)
      const data = await connectCA410();
      if (!data?.success) {
        // 실패하면 폴링 시작
        startPolling();
      }
    }
  };

  useEffect(() => {
    const handlePortOpen = () => {
      setIsConnected(true);
      stopPolling();
    };

    const handlePortClose = async () => {
      setIsConnected(false);
      try {
        const ports = await listSerialPorts();
        setSerialPorts(ports || []);
        setSelectedPort('');
        setDisableButton(!(Array.isArray(ports) && ports.length > 0));
      } catch (e) {
        console.error('포트 목록 조회 실패:', e);
        setSerialPorts([]);
        setSelectedPort('');
        setDisableButton(true);
      }
      // 닫혔으면 재탐색 폴링 시작
      startPolling();
    };

    const handlePortError = (error) => {
      console.error('포트 에러 발생:', error);
      // 필요 시 폴링 재개
      startPolling();
    };

    // Electron 환경에서만 이벤트 바인딩
    if (ipc) {
      ipc.on('port-open', handlePortOpen);
      ipc.on('port-close', handlePortClose);
      ipc.on('port-err', handlePortError);
    }

    // 초기 연결 시도
    (async () => {
      const data = await connectCA410();
      if (!data?.success) {
        // 실패하면 초기에 포트 목록이라도 갱신
        try {
          const ports = await listSerialPorts();
          setSerialPorts(ports || []);
          setDisableButton(!(Array.isArray(ports) && ports.length > 0));
        } catch (e) {
          console.error('초기 포트 목록 조회 실패:', e);
        }
        // 그리고 폴링 시작
        startPolling();
      }
    })();

    // 반응형 처리
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setShowX(false);
      } else {
        setShowX(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      // 이벤트 해제
      if (ipc) {
        ipc.removeListener('port-open', handlePortOpen);
        ipc.removeListener('port-close', handlePortClose);
        ipc.removeListener('port-err', handlePortError);
      }
      // 폴링 정지
      stopPolling();
    };
  }, []); // mount/unmount

  /* 페이지 제목 및 부제목 제너레이터 */
  const getTitleAndSubtitle = () => {
    const currentPath = location.pathname;
    switch (currentPath) {
      default:
        return { title: '', subtitle: '' };
    }
  };

  const { title, subtitle } = getTitleAndSubtitle();

  return (
    <div className="flex h-screen bg-gray-100">
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out bg-gray-900 w-64 shadow-lg`}
      >
        <div className="flex items-center justify-between h-14 bg-gray-700 shadow-md px-4">
          <span className="text-white font-bold uppercase tracking-widest">
            <b className="text-red-500">Tovis</b> Display Test
          </span>
          {showX && (
            <button onClick={toggleSidebar} className="text-white focus:outline-none">
              X
            </button>
          )}
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-4 py-6 space-y-2 bg-gray-900">
            {links.map((link, index) => (
              <div key={index}>
                <div className="flex items-center justify-between px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg">
                  <Link to={link.path} className="flex items-center flex-1" onClick={() => setIsSidebarOpen(false)}>
                    <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                      />
                    </svg>
                    {link.label}
                  </Link>
                  {link.subLinks.length > 0 && (
                    <button onClick={() => toggleMenu(index)} className="text-white focus:outline-none">
                      {openMenus[index] ? '▾' : '▸'}
                    </button>
                  )}
                </div>
                {openMenus[index] && link.subLinks.length > 0 && (
                  <div className="ml-8 mt-1 space-y-1">
                    {link.subLinks.map((sub, subIndex) => (
                      <Link
                        key={subIndex}
                        to={sub.path}
                        className="block px-4 py-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="flex items-center justify-between h-16 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center px-4">
            <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none focus:text-gray-700 md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
          <div className="flex items-center pr-4 space-x-4">
            <select
              onChange={handlePortSelect}
              value={selectedPort || ''} // 문자열 자체로 관리
              className="border rounded-md px-8 mt-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {serialPorts?.length === 0 && <option value="">PORT</option>}
              {serialPorts?.length > 0 ? (
                serialPorts.map((port) => (
                  <option key={port} value={port}>
                    {port}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No Ports Available
                </option>
              )}
            </select>

            <button
              onClick={toggleConnection}
              className={`px-4 py-1 mt-4 mb-3 rounded-md text-white ${isConnected ? 'bg-red-500' : 'bg-green-500'} ${
                disableButton ? ' cursor-not-allowed' : ''
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={disableButton}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          <p className="mt-2 text-gray-600">{subtitle}</p>
          {location.pathname === '/' ? (
            <div className="mt-10 flex flex-col items-center justify-center bg-grey-400">
              <p className=" text-gray-600">시작하려면 사이드바에서 메뉴 항목을 선택하세요.</p>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex flex-col items-center justify-center md:hidden">
          <button onClick={toggleMobileMenu} className="absolute top-4 right-4 text-white focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <nav className="space-y-4">
            {links.map((link, index) => (
              <Link key={index} to={link.path} className="text-white text-lg" onClick={toggleMobileMenu}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export default Layout;
