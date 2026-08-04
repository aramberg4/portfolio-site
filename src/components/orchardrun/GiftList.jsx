import React, { useEffect, useState } from 'react';
import { GIFT_TIERS } from './giftItems';

// Same Firebase RTDB backing as the original standalone wishlist page.
// Rules (database.rules.json): /claimed is world-readable; writes only allow
// setting claimed/$item to `true`. Accessed via the RTDB REST + SSE API so no
// firebase SDK dependency is needed.
const DB_URL = 'https://austin-wishlist-default-rtdb.firebaseio.com';

const GiftList = () => {
  const [claimed, setClaimed] = useState({});

  useEffect(() => {
    // RTDB streams put/patch events to EventSource clients on the same URL.
    const es = new EventSource(`${DB_URL}/claimed.json`);
    es.addEventListener('put', (e) => {
      const { path, data } = JSON.parse(e.data);
      setClaimed((prev) => (path === '/' ? data || {} : { ...prev, [path.slice(1)]: data }));
    });
    es.addEventListener('patch', (e) => {
      const { data } = JSON.parse(e.data);
      setClaimed((prev) => ({ ...prev, ...(data || {}) }));
    });
    return () => es.close();
  }, []);

  const claim = (id) => {
    if (claimed[id]) return;
    setClaimed((prev) => ({ ...prev, [id]: true }));
    fetch(`${DB_URL}/claimed/${id}.json`, { method: 'PUT', body: 'true' }).catch(() => {
      // The SSE stream is the source of truth; a failed write simply never
      // confirms, and the next put event restores the real state.
    });
  };

  return (
    <div className="orun-gifts">
      <p className="orun-gifts-intro">
        No pressure and nothing required — these are just ideas, sorted by how they're
        easiest to pull off. Tap any item for the link, and hit <strong>mark as picked</strong> once
        you've grabbed one so nobody doubles up. Prices are ballpark.
      </p>

      {GIFT_TIERS.map((tier) => (
        <section className="orun-tier" key={tier.no}>
          <div className="orun-tier-head">
            <span className="orun-tier-no">{tier.no}</span>
            <span className="orun-tier-name">{tier.name}</span>
            <span className="orun-tier-price">{tier.price}</span>
          </div>
          <p className="orun-tier-note">{tier.note}</p>
          <ul className="orun-items">
            {tier.items.map((item) => {
              const isClaimed = !!claimed[item.id];
              return (
                <li key={item.id} className={`orun-item${isClaimed ? ' claimed' : ''}`}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="orun-item-link">
                    <span className="orun-item-name">
                      {item.name}
                      <span className="orun-item-tag">{item.tag}</span>
                    </span>
                    <span className="orun-item-price">{item.price}</span>
                  </a>
                  <button
                    type="button"
                    className="orun-claim-btn"
                    aria-label={`Mark ${item.name} as picked`}
                    disabled={isClaimed}
                    onClick={() => claim(item.id)}
                  >
                    {isClaimed ? '✓ picked' : 'mark as picked'}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="orun-gifts-foot">
        <strong>Thanks for celebrating.</strong> Prices drift, so treat the numbers as a guide
        rather than gospel. Mix and match across tiers however works for you — or surprise
        me, totally fine.
      </p>
    </div>
  );
};

export default GiftList;
