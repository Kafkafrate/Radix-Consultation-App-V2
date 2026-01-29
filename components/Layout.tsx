import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRadix } from '../services/radixService';
import { Button } from './Button';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userState, connect, disconnect, toggleAdminMode } = useRadix();
  const [darkMode, setDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const navLinkClass = (path: string) => 
    `text-sm font-medium transition-colors ${location.pathname === path ? 'text-black dark:text-white' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`;

  const mobileNavLinkClass = (path: string) =>
    `block px-3 py-2 rounded-md text-base font-medium ${location.pathname === path ? 'bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white' : 'text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800'}`;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center">
                  <span className="text-white dark:text-black font-bold text-xl">R</span>
                </div>
                <span className="font-semibold text-lg tracking-tight text-neutral-900 dark:text-white group-hover:opacity-80 transition-opacity">
                  Consultation<span className="font-light text-neutral-500">v2</span>
                </span>
              </Link>
              
              {/* Desktop Menu */}
              <div className="hidden md:flex space-x-6">
                <Link to="/" className={navLinkClass('/')}>
                  Proposals
                </Link>
                <Link to="/about" className={navLinkClass('/about')}>
                  About
                </Link>
                {userState.isConnected && (
                  <>
                    <Link to="/create" className={navLinkClass('/create')}>
                      New Proposal
                    </Link>
                    <Link to="/settings" className={navLinkClass('/settings')}>
                      Settings
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                aria-label="Toggle Theme"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Desktop Wallet Connection / Status */}
              <div className="hidden md:flex items-center gap-3">
                {userState.isConnected ? (
                  <>
                    <div className="flex flex-col items-end mr-2">
                      <span className="text-xs text-neutral-500 uppercase tracking-wide">
                        {userState.isAdmin ? 'Admin (Council)' : 'Voter'}
                      </span>
                      <span className="text-xs font-mono text-neutral-900 dark:text-neutral-300">
                        {userState.address?.slice(0, 4)}...{userState.address?.slice(-4)}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={disconnect} className="text-xs">
                      Disconnect
                    </Button>
                    <button onClick={toggleAdminMode} className="ml-2 text-[10px] text-neutral-600 underline" title="Demo Only">
                      Toggle Role
                    </button>
                  </>
                ) : (
                   <Button variant="primary" onClick={connect}>
                     Connect Wallet
                   </Button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="-mr-2 flex md:hidden">
                 <button
                   onClick={() => setIsMenuOpen(!isMenuOpen)}
                   className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-black dark:hover:text-white focus:outline-none"
                 >
                   <span className="sr-only">Open main menu</span>
                   {isMenuOpen ? (
                     <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   ) : (
                     <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                     </svg>
                   )}
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className={mobileNavLinkClass('/')} onClick={() => setIsMenuOpen(false)}>Proposals</Link>
              <Link to="/about" className={mobileNavLinkClass('/about')} onClick={() => setIsMenuOpen(false)}>About</Link>
              {userState.isConnected && (
                <>
                  <Link to="/create" className={mobileNavLinkClass('/create')} onClick={() => setIsMenuOpen(false)}>New Proposal</Link>
                  <Link to="/settings" className={mobileNavLinkClass('/settings')} onClick={() => setIsMenuOpen(false)}>Settings</Link>
                </>
              )}
            </div>
            
            {/* Mobile Wallet Controls */}
            <div className="pt-4 pb-4 border-t border-neutral-200 dark:border-neutral-800">
              <div className="px-4 flex items-center gap-4">
                 {userState.isConnected ? (
                   <div className="w-full space-y-3">
                      <div className="flex items-center justify-between">
                         <div className="flex flex-col">
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">
                              {userState.isAdmin ? 'Admin (Council)' : 'Voter'}
                            </span>
                            <span className="text-xs text-neutral-500 font-mono">{userState.address}</span>
                         </div>
                         <Button variant="outline" size="sm" onClick={() => { disconnect(); setIsMenuOpen(false); }}>
                            Disconnect
                         </Button>
                      </div>
                      <button onClick={toggleAdminMode} className="text-xs text-neutral-500 underline w-full text-left">
                        Switch Role (Demo)
                      </button>
                   </div>
                 ) : (
                   <Button variant="primary" className="w-full" onClick={() => { connect(); setIsMenuOpen(false); }}>
                     Connect Wallet
                   </Button>
                 )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-neutral-500 text-sm">
            Powered by Radix DLT. Stokenet Environment.
          </p>
        </div>
      </footer>
    </div>
  );
};