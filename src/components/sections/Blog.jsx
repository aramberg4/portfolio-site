import React from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

// Field notes are standalone static pages in public/, served via Netlify
// redirects — use plain <a> tags, not react-router Links.
const posts = [
  {
    id: 5,
    series: 'Polywatch · Field Notes',
    date: '2026-09-02',
    title: 'Two algos in the red at day 50. One had a bad idea; the other had a bad implementation.',
    description:
      'Day-50 verdicts on the two losing paper algos. Inverse Losers is retired: losers lose on price, not direction, and its post-fix book held both sides of the same Fed markets. Insider Echo gets a 40¢ entry floor: copies below it went 6-for-28 and lost $2,818; copies above it beat the control.',
    url: '/polywatch-day50',
    tags: ['Prediction Markets', 'Retrospective', 'Data Analysis']
  },
  {
    id: 4,
    series: 'Polywatch · Field Notes',
    date: '2026-08-23',
    title: 'The Djdjdjekekek Incident',
    description:
      'Top 10 Mirror’s worst weekend: a 48-day-old wallet on a $5M heater ranked onto the roster, the mirror put 41% of equity behind its weekend sports bets, and every seat gate was arithmetically blind to it. What held, what failed, and the five rules shipping before next weekend.',
    url: '/polywatch-djdjdjekekek',
    tags: ['Prediction Markets', 'Post-Mortem', 'Data Analysis']
  },
  {
    id: 3,
    series: 'Polywatch · Field Notes',
    date: '2026-08-17',
    title: 'We gave seven algorithms $10,000 each. A month later, one has made basically all the money.',
    description:
      'A day-33 retrospective of all seven paper-trading algos: the rebuilt leaderboard-copier is carrying 99% of realized profit, exit rules beat entry signals everywhere, the control quietly lost — and six books have re-bet the September Fed meeting.',
    url: '/polywatch-day33',
    tags: ['Prediction Markets', 'Retrospective', 'Data Analysis']
  },
  {
    id: 2,
    series: 'Polywatch · Field Notes',
    date: '2026-07-30',
    title: 'We bet against Polymarket’s biggest losers. The losers were right.',
    description:
      'Inverse Losers led the paper-trading scoreboard for six days, then went first-to-worst in one Fed announcement. A post-mortem on paper-mark leads, an 86%-concentrated book, and why fading losers fails when losers bet the favorite.',
    url: '/polywatch-inverse-losers',
    tags: ['Prediction Markets', 'Post-Mortem', 'Data Analysis']
  },
  {
    id: 1,
    series: 'Polywatch · Field Notes',
    date: '2026-07-28',
    title: 'We copied Polymarket’s ten most profitable traders. It lost money — fast.',
    description:
      'The all-time leaderboard turned out to be arbitrage bots, not oracles: zero mirror exits ever, slippage bigger than the edge, and hedges copied without the hedge. What went wrong and how v3 picks genuine bettors instead.',
    url: '/polywatch-top10',
    tags: ['Prediction Markets', 'Post-Mortem', 'Data Analysis']
  }
];

const PostCard = ({ post }) => (
  <a
    href={post.url}
    className="block bg-gray-800 rounded-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group"
  >
    <div className="flex items-center gap-3 mb-3 text-xs font-medium">
      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-green-400 text-white">
        {post.series}
      </span>
      <span className="text-gray-400">{post.date}</span>
    </div>

    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-200">
      {post.title}
    </h2>

    <p className="text-gray-300 text-sm mb-5 leading-relaxed">
      {post.description}
    </p>

    <div className="flex flex-wrap items-center gap-2">
      {post.tags.map((tag) => (
        <span
          key={tag}
          className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-green-400/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30"
        >
          {tag}
        </span>
      ))}
      <span className="ml-auto flex items-center gap-1 text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors duration-200">
        Read
        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
      </span>
    </div>
  </a>
);

export default function Blog() {
  return (
    <div className="relative overflow-hidden min-h-screen bg-gray-900 py-16 pt-24 font-serif">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-gray-900 to-green-900/10"></div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Blog
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-green-400 mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Field notes from my live experiments — what worked, what broke,
            and what the data actually said.
          </p>
        </div>

        {/* Posts */}
        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
