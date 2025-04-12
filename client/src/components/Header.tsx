import { useState } from 'react';
import { Link, useLocation } from 'wouter';

const Header = () => {
  const [location] = useLocation();
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  
  const isActive = (path: string) => location === path;
  
  return (
    <header className="border-b border-[#30363D] px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L4 7v10l8 6 8-6V7l-8-6zm0 2.236L18 8v8l-6 4.5-6-4.5V8l6-4.764z"></path>
            </svg>
            <h1 className="text-xl font-bold font-mono ml-2 text-text-primary">CryptoMine<span className="text-accent">AI</span></h1>
          </div>
          <div className="hidden md:flex gap-4">
            <Link href="/" className={`px-3 py-2 text-sm ${isActive('/') ? 'border-b-2 border-accent text-foreground' : 'text-muted-foreground'}`}>
              Dashboard
            </Link>
            <Link href="/workers" className={`px-3 py-2 text-sm ${isActive('/workers') ? 'border-b-2 border-accent text-foreground' : 'text-muted-foreground'}`}>
              Workers
            </Link>
            <Link href="/analytics" className={`px-3 py-2 text-sm ${isActive('/analytics') ? 'border-b-2 border-accent text-foreground' : 'text-muted-foreground'}`}>
              Analytics
            </Link>
            <Link href="/settings" className={`px-3 py-2 text-sm ${isActive('/settings') ? 'border-b-2 border-accent text-foreground' : 'text-muted-foreground'}`}>
              Settings
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              type="button" 
              className="flex items-center bg-secondary px-3 py-1.5 rounded-sm text-sm border border-[#30363D] hover:border-[#6E7681]"
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
            >
              <span className="font-mono">bitcoin</span>
              <svg className="h-4 w-4 ml-1.5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {currencyDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-secondary border border-[#30363D] rounded-sm shadow-lg z-10">
                <div className="max-h-60 overflow-y-auto py-1">
                  {['bitcoin', 'litecoin', 'bitcoin-cash'].map((currency) => (
                    <button
                      key={currency}
                      className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                      onClick={() => setCurrencyDropdownOpen(false)}
                    >
                      <span className="font-mono">{currency}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="bg-secondary p-1.5 rounded-sm border border-[#30363D] hover:border-[#6E7681]">
            <svg className="h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
          </button>
          <div className="h-6 w-6 rounded-full bg-[#A371F7] flex items-center justify-center text-xs font-bold text-white">
            JP
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
