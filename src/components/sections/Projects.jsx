import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowTopRightOnSquareIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import pitch from '../../resources/pitch2.png';
import mongodd from '../../resources/mongoD&D.png';
import lamps from '../../resources/lamps.PNG';
import polywatch from '../../resources/polywatch.png';

const projects = [
  {
    id: 1,
    title: 'NFL Target Share Analyzer',
    description: 'Interactive data visualization tool showing wide receiver target distribution by team and week. Perfect for fantasy football analysis with weekly data updates.',
    image: 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
    technologies: ['React', 'Chart.js', 'NFL Data APIs', 'Fantasy Football'],
    liveUrl: '/nfl-target-share',
    githubUrl: 'https://github.com/aramberg4/portfolio-site',
    type: 'Data Visualization',
    featured: true,
    isInternal: true
  },
  {
    id: 6,
    title: 'Polywatch',
    description: 'Seven algorithmic paper-trading bots race on Polymarket in real time, each testing a different theory about whose money to follow — whales, insiders, smart money, or the leaderboard elite. Live standings, equity curves, and a full trade log, benchmarked against a copy-everything control.',
    image: polywatch,
    technologies: ['React', 'Chart.js', 'Node.js', 'SQLite', 'Polymarket APIs'],
    liveUrl: '/polywatch',
    githubUrl: null,
    type: 'Live Experiment',
    featured: true,
    isInternal: true
  },
  {
    id: 2,
    title: 'Lamps.com',
    description: 'I am currently a software engineer at Lamps.com - an online retailer for everything lighting and more.',
    image: lamps,
    technologies: ['Django', 'PostgreSQL', 'E-commerce', 'AWS'],
    liveUrl: 'https://lamps.com',
    githubUrl: null,
    type: 'Professional',
    featured: true
  },
  {
    id: 3,
    title: 'Pitch',
    description: 'Angular App that helps local musicians and venues connect.',
    image: pitch,
    technologies: ['Angular', 'TypeScript', 'Firebase', 'PWA'],
    liveUrl: null,
    githubUrl: 'https://github.com/jmccar385/Pitch',
    type: 'Collaboration',
    featured: true
  },
  {
    id: 4,
    title: 'PageRank',
    description: 'My own basic implementation of the Page Rank Algorithm derived by Lawrence Page and Sergey Brin using Python 2.',
    image: 'https://anthonybonato.files.wordpress.com/2017/06/illustration3.png?w=980&h=400&crop=1',
    technologies: ['Python', 'Graph Theory', 'Algorithms', 'Data Science'],
    liveUrl: null,
    githubUrl: 'https://github.com/aramberg4/PageRank',
    type: 'Algorithm',
    featured: false
  },
  {
    id: 5,
    title: 'MongoD&D',
    description: 'D&D 5e spell management tool built using Python and MongoDB.',
    image: mongodd,
    technologies: ['Python', 'MongoDB', 'Flask', 'REST API'],
    liveUrl: null,
    githubUrl: 'https://github.com/aramberg4/INFO_366_Project',
    type: 'Full Stack',
    featured: false
  }
];

const ProjectCard = ({ project }) => {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        {/* Project Type Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            project.featured
              ? 'bg-gradient-to-r from-blue-500 to-green-400 text-white'
              : 'bg-gray-900/80 text-gray-300'
          }`}>
            {project.type}
          </span>
        </div>
      </div>

      {/* Project Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-200">
          {project.title}
        </h3>

        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.technologies.map((tech, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-green-400/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30 hover:border-blue-400/50 transition-colors duration-200"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {project.liveUrl && (
            project.isInternal ? (
              <Link
                to={project.liveUrl}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded-lg font-medium hover:from-blue-600 hover:to-green-500 transition-all duration-200 hover:scale-105"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                Try Demo
              </Link>
            ) : (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded-lg font-medium hover:from-blue-600 hover:to-green-500 transition-all duration-200 hover:scale-105"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                Visit Site
              </a>
            )
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 hover:text-white transition-all duration-200 hover:scale-105"
            >
              <CodeBracketIcon className="w-4 h-4" />
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Projects() {
  const featuredProjects = projects.filter(project => project.featured);
  const otherProjects = projects.filter(project => !project.featured);

  return (
    <div className="min-h-screen bg-gray-900 py-16 pt-24">

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-gray-900 to-green-900/10"></div>

      {/* Enhanced animated background particles */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            My Projects
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-green-400 mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            A collection of projects showcasing my expertise in web development,
            algorithms, and full-stack applications.
          </p>
        </div>

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Featured Projects
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {/* Other Projects */}
        {otherProjects.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Other Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6">
            Interested in working together or want to see more?
          </p>
          <a
            href="https://github.com/aramberg4"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded-lg font-medium hover:from-blue-600 hover:to-green-500 transition-all duration-200 hover:scale-105"
          >
            <CodeBracketIcon className="w-5 h-5" />
            View All on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}