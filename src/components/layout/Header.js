import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BoltIcon } from '@heroicons/react/24/outline';
import Pdf from '../../resources/resumeFullNoPhone.pdf';

const navigation = [
  { name: 'Home', href: '/', current: false },
  { name: 'Projects', href: '/projects', current: false },
  { name: 'About', href: '/aboutme', current: false },
  // { name: 'Resume', href: Pdf, current: false, external: true },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Update current navigation item based on location
  const updatedNavigation = navigation.map(item => ({
    ...item,
    current: item.href === location.pathname
  }));

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-green-400 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link
                to="/"
                className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors duration-200"
              >
                <BoltIcon className="h-6 w-6" />
                <span className="text-xl font-semibold">Austin Ramberg</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {updatedNavigation.map((item) =>
                item.external ? (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-gray-200 hover:bg-white/10 rounded-md transition-all duration-200"
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      item.current
                        ? 'border-white text-white bg-white/10'
                        : 'border-transparent text-white hover:border-gray-300 hover:text-gray-200 hover:bg-white/10',
                      'inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium rounded-t-md transition-all duration-200'
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-md bg-white/10 p-2 text-white hover:bg-white/20 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2 bg-black/10 backdrop-blur-sm">
            {updatedNavigation.map((item) =>
              item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-white hover:border-white hover:bg-white/10 hover:text-gray-200 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    item.current
                      ? 'border-white bg-white/10 text-white'
                      : 'border-transparent text-white hover:border-gray-300 hover:bg-white/10 hover:text-gray-200',
                    'block border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-all duration-200'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}