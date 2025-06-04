import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { openSerialPort, closeSerialPort, getSerialPortList } from '../apis/serial.js';

const links = [
  { path: '/serdes', label: '레지스터 세팅', subLinks: [] },
  { path: '/alarm', label: '경고등', subLinks: [] },
  { path: '/alarmcrc', label: '경고등CRC', subLinks: [] },
  { path: '/usb', label: '펌웨어 업데이트', subLinks: [] },
  { path: '/monitoring', label: 'Fault모니터링(실시간)', subLinks: [] },
  { path: '/adclog', label: 'Fault모니터링(단건)', subLinks: [] },
  { path: '/log', label: '로그 모니터링&제어', subLinks: [] },
  {
    path: '/serdes/manual',
    label: '디스플레이테스트(수동)',
    subLinks: [
      { path: '/test/manual/pattern', label: '불량화소테스트' },
      { path: '/test/manual/viewangle', label: '시야각테스트' },
      { path: '/test/manual/contrastratio', label: '명암비테스트' },
      { path: '/test/manual/readability', label: '가독성 테스트' },
      { path: '/test/manual/colorratio', label: '색상비 테스트' },
      { path: '/test/manual/lightleak', label: '빛샘 멍 테스트' },
    ],
  },
  {
    path: '/serdes/auto',
    label: '테스트(자동)',
    subLinks: [
      { path: '/test/auto/pattern/gamma', label: '감마 테스트' },
      { path: '/test/auto/ser/viewangle', label: '시야각 테스트' },
      { path: '/test/auto/des/contrast', label: '명암비 테스트' },
    ],
  },
];

const Layout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serialPorts, setSerialPorts] = useState([]);
  const [selectedPort, setSelectedPort] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [disableButton, setDisableButton] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showX, setShowX] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    alert('모바일 메뉴');
  };
  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const getSerialPorts = async () => {
    try {
      const ports = await getSerialPortList();
      setSerialPorts(ports);
    } catch (error) {
      console.error('시리얼 포트 리스트를 가져오는데 문제가 발생했습니다:', error);
    }
  };

  useEffect(() => {
    getSerialPorts();
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setShowX(false);
      } else {
        setShowX(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePortSelect = (event) => {
    const portIndex = event.target.value;
    if (String(serialPorts[portIndex]?.path).startsWith('COM')) {
      setDisableButton(false);
      setSelectedPort(serialPorts[portIndex]?.path);
    }
  };

  const toggleConnection = async () => {
    if (isConnected) {
      try {
        await closeSerialPort({ portName: selectedPort });
        setIsConnected(false);
      } catch (error) {
        console.error('Failed to disconnect:', error);
      }
    } else {
      if (selectedPort) {
        try {
          await openSerialPort({ portName: selectedPort });
          setIsConnected(true);
        } catch (error) {
          console.error('Failed to connect:', error);
        }
      }
    }
  };

  const getTitleAndSubtitle = () => {
    const currentPath = location.pathname;
    switch (currentPath) {
      case '/serdes':
        return { title: '레지스터 설정', subtitle: '시리얼라이져/디시리얼라이져/인디고 레지스터세팅' };
      case '/alarm':
        return { title: 'Alarm', subtitle: '경고등 제어' };
      case '/usb':
        return { title: 'Firmware Update', subtitle: 'Firmware Update Setting' };
      case '/monitoring':
        return { title: 'Fault 모니터링', subtitle: 'Safety A/D 보드 실시간 진단' };
      case '/log':
        return { title: '로그 모니터링', subtitle: 'Safety A/D 보드 로그 기록' };
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
            <b className="text-red-500">Safety</b> A/D Board
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
          <div className="flex items-center pr-4 space-x-4">
            <select
              onChange={handlePortSelect}
              className="border rounded-md px-4 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">PORT</option>
              {serialPorts.map((port, index) => (
                <option key={index} value={index}>
                  {port.path}
                </option>
              ))}
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
            <button
              onClick={getSerialPorts}
              className="px-4 py-1 mt-3 mb-3 rounded-md text-white bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              포트조회
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
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
