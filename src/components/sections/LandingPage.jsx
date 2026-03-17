import React from 'react';
import banner from '../../resources/headshot2.jpg';

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/aramberg4',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/austinramberg/',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    name: 'LeetCode',
    href: 'https://leetcode.com/aero11/',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.381 1.38 1.38 0 0 0 1.38 1.381 1.38 1.38 0 0 0 1.381-1.381 1.38 1.38 0 0 0-1.381-1.381z"/>
      </svg>
    ),
  },
];

const skills = [
  'Python', 'C#', 'SQL', 'React', 'Angular', 'TensorFlow'
];

// Generate stable particle positions and timing
const generateParticles = () => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
  }));
};

const particleData = generateParticles();

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden pt-20">

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-gray-900 to-green-900/20"></div>

      {/* Enhanced animated background particles */}
      <div className="absolute inset-0">
        {particleData.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <div className="text-center lg:text-left animate-fade-in">
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                Austin Ramberg
              </h1>
              <h2 className="text-xl sm:text-2xl lg:text-3xl text-blue-400 mb-6">
                WebDev | E-Commerce | AI
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-green-400 mx-auto lg:mx-0 mb-6"></div>
            </div>

            <div className="mb-8">
              <p className="text-gray-300 text-lg mb-6 max-w-lg mx-auto lg:mx-0">
                Software engineer passionate about building intelligent solutions and creating exceptional user experiences.
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
                {skills.map((skill, index) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-green-400/20 text-white rounded-full text-sm font-medium border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200 hover:scale-105"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-start space-x-6">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-all duration-200 p-3 rounded-full hover:bg-white/10 hover:scale-110 hover:-translate-y-1"
                >
                  <span className="sr-only">{link.name}</span>
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right column - Image */}
          <div className="flex justify-center lg:justify-end animate-slide-up">
            <div className="relative">
              <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-blue-500 p-1 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-blue-500/10 to-green-400/10 backdrop-blur-sm">
                  <img
                    src={banner}
                    alt="Austin Ramberg"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Floating decoration */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-500 to-green-400 rounded-full opacity-80 animate-bounce-slow"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-60 animate-pulse"></div>
              <div style={{
                position: 'absolute',
                top: '-16px',
                right: '-24px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(to right, #4ade80, #3b82f6)',
                opacity: 0.85,
                zIndex: 10,
                animation: 'bounce 2s infinite',
                animationDelay: '0.8s'
              }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}