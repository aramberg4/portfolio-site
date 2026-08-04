import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Routes that stand alone (shared by direct link) and shouldn't carry the site nav
const STANDALONE_ROUTES = ['/austins-30th'];

const Header = () => {
  const { pathname } = useLocation();
  if (STANDALONE_ROUTES.includes(pathname)) return null;
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'linear-gradient(to right, #2563eb, #22c55e)',
      backdropFilter: 'blur(4px)',
      borderBottom: '1px solid rgba(59, 130, 246, 0.3)'
    }}>
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 0'
        }}>
          <Link to="/" style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: 'white',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}>
            Austin Ramberg
          </Link>

          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/projects" style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}>
              Projects
            </Link>
            <Link to="/nfl-target-share" style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}>
              NFL Stats
            </Link>
            <Link to="/fantasy-football" style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}>
              Fantasy
            </Link>
            <Link to="/aboutme" style={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s'
            }}>
              About
            </Link>
            {/* <a
              href={Pdf}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'white',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s'
              }}
            >
              Resume
            </a> */}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;