import React from 'react';
import { AcademicCapIcon, BriefcaseIcon, StarIcon, HeartIcon } from '@heroicons/react/24/outline';

const experiences = [
  {
    id: 1,
    role: 'Software Engineer',
    company: 'Lamps.com',
    period: 'Current',
    description: 'Building scalable e-commerce solutions with Django and more.',
    technologies: ['Django', 'Python', 'PostgreSQL', 'AWS', 'E-commerce'],
    type: 'professional'
  },
  {
    id: 2,
    role: 'Software Development Co-Op',
    company: 'Brandywine Global Investment Mgmt., LLC',
    period: 'Mar 2017 – Mar 2019',
    description: 'Built ASP.NET web application for Foreign Exchange Netting report creation and dissemination. Contributed to full software life cycle and collaborated on maintenance of over 1,000 internal batch jobs during accounting engine upgrade.',
    technologies: ['Perl', 'ASP.NET', 'C#', 'SQL', 'Production Support'],
    type: 'professional'
  },
  {
    id: 3,
    role: 'Business Support Co-Op',
    company: 'Susquehanna International Group, LLP',
    period: 'Mar 2016 – Sep 2016',
    description: 'Created a web-based market test order status monitoring tool and monitored latency of trading TCP traffic using exponential moving averages. Developed automated batch jobs for business reports and alerts.',
    technologies: ['Python', 'JavaScript', 'AJAX', 'Trading Systems', 'Performance Monitoring'],
    type: 'professional'
  },
  {
    id: 4,
    role: 'Business Analytics Intern',
    company: 'Bottomline Technologies, Inc.',
    period: 'Jun 2015 – Sep 2015',
    description: 'Modeled the likelihood of existing customers to join new platform using Random Forests in R. Gathered and scrubbed large data sets containing 250,000+ records and delivered predictive model to Sales and Marketing team.',
    technologies: ['R', 'Random Forests', 'Data Analysis', 'Machine Learning'],
    type: 'professional'
  }
];

const skills = [
  {
    category: 'Languages',
    items: ['Python', 'JavaScript', 'TypeScript', 'C#', 'SQL'],
    icon: '💻'
  },
  {
    category: 'Frontend',
    items: ['React', 'Angular', 'Vue.js', 'Tailwind CSS', 'Responsive Design'],
    icon: '🎨'
  },
  {
    category: 'Backend',
    items: ['Node.js', 'Flask', 'REST APIs', 'GraphQL', 'Microservices'],
    icon: '⚙️'
  },
  {
    category: 'Cloud & Tools',
    items: ['AWS', 'Firebase', 'Docker', 'Git', 'CI/CD'],
    icon: '☁️'
  },
  {
    category: 'Data & AI',
    items: ['TensorFlow', 'MongoDB', 'PostgreSQL', 'Data Analysis', 'Machine Learning'],
    icon: '🧠'
  }
];

const education = [
  {
    degree: 'Bachelor of Science in Informatics',
    institution: 'Drexel University | Philadelphia, PA',
    focus: 'Algorithms, Data Structures, Web Development',
    achievements: ['Cumulative GPA: 3.83', 'Graduated Magna Cum Laude in June 2019']
  }
];

const personalQualities = [
  {
    icon: <StarIcon className="w-6 h-6" />,
    title: 'Problem Solver',
    description: 'Passionate about breaking down complex challenges into manageable solutions'
  },
  {
    icon: <HeartIcon className="w-6 h-6" />,
    title: 'User-Focused',
    description: 'Committed to creating experiences that genuinely improve people\'s lives'
  },
  {
    icon: <AcademicCapIcon className="w-6 h-6" />,
    title: 'Continuous Learner',
    description: 'Always exploring new technologies and best practices in software development'
  }
];

export default function AboutMe() {
  return (
    <div className="relative overflow-hidden min-h-screen bg-gray-900 py-16 pt-24">

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-gray-900 to-green-900/10"></div>

      {/* Enhanced animated background particles */}
      <div className="absolute inset-0">
        {[...Array(35)].map((_, i) => (
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            About Me
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-green-400 mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            I'm a passionate software engineer who bridges the gap between innovative technology and exceptional user experiences.
            With expertise spanning web development, e-commerce, and AI, I bring both technical depth and creative vision to every project.
          </p>
        </div>

        {/* Experience Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Professional Experience</h2>
          <div className="space-y-6">
            {experiences.map((exp) => (
              <div key={exp.id} className="bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{exp.role}</h3>
                    <p className="text-blue-400 font-medium">{exp.company}</p>
                  </div>
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-green-400/20 text-green-300 rounded-full text-sm font-medium border border-green-500/30">
                    {exp.period}
                  </span>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">{exp.description}</p>
                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-green-400/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Technical Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skillGroup, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{skillGroup.icon}</span>
                  <h3 className="text-xl font-bold text-white">{skillGroup.category}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-green-400/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30 hover:border-blue-400/50 transition-colors duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Education & Learning</h2>
          {education.map((edu, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <AcademicCapIcon className="w-8 h-8 text-blue-400 mr-3" />
                <div>
                  <h3 className="text-xl font-bold text-white">{edu.degree}</h3>
                  <p className="text-blue-400">{edu.institution}</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">{edu.focus}</p>
              <div className="space-y-2">
                {edu.achievements.map((achievement, achievementIndex) => (
                  <div key={achievementIndex} className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    <span className="text-gray-300 text-sm">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Personal Qualities */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">What Drives Me</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {personalQualities.map((quality, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500/20 to-green-400/20 rounded-full border border-blue-500/30">
                    {quality.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{quality.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{quality.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Let's Build Something Amazing</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            I'm always excited to collaborate on innovative projects and explore new opportunities.
            Whether it's building the next great user experience or solving complex technical challenges, let's connect!
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="https://github.com/aramberg4"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-400 text-white rounded-lg font-medium hover:from-blue-600 hover:to-green-500 transition-all duration-200 hover:scale-105"
            >
              <BriefcaseIcon className="w-5 h-5" />
              View My Work
            </a>
            <a
              href="https://www.linkedin.com/in/austinramberg/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 hover:text-white transition-all duration-200 hover:scale-105"
            >
              Let's Connect
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}