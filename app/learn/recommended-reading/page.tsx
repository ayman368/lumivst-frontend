'use client';

import { ExternalLink } from 'lucide-react';

const readings = [
  {
    title: 'Momentum Masters - A Roundtable Insight',
    author: 'Mark Minervin, Bo...',
    bestPrice: '$27.00',
    asin: '0996307907',
    url: 'https://www.amazon.com/dp/0996307907/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=0996307907',
    color: '#3e5c76',
    hasImage: true,
  },
  {
    title: 'How to Make Money in Stocks',
    author: 'William O\'Neil',
    bestPrice: '$4.50',
    asin: 'B001929QGW',
    url: 'https://www.amazon.com/gp/product/B001929QGW/ref=as_li_tl?ie=UTF8&tag=chartpatter0b-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B001929QGW',
    color: '#c0392b',
    hasImage: true,
  },
  {
    title: 'Reminiscences of a Stock Operator',
    author: 'Edwin Lefèvre, Ro...',
    bestPrice: '$4.99',
    asin: '0471770884',
    url: 'https://www.amazon.com/dp/0471770884/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=0471770884',
    color: '#8b7355',
    hasImage: true,
  },
  {
    title: 'How Technical Analysis Works',
    author: 'Bruce M. Kamich',
    bestPrice: '$31.21',
    asin: '0735202702',
    url: 'https://www.amazon.com/dp/0735202702/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=0735202702',
    color: '#2c3e50',
    hasImage: true,
  },
  {
    title: 'How I Made $2,000,000 in the Stock Market',
    author: 'Nicolas Darvas',
    bestPrice: '$3.98',
    asin: '1578988446',
    url: 'https://www.amazon.com/dp/1578988446/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=1578988446',
    color: '#d35400',
    hasImage: true,
  },
  {
    title: 'Japanese Candlestick Charting Techniques',
    author: 'Steve Nison',
    bestPrice: '$43.76',
    asin: '0735201811',
    url: 'https://www.amazon.com/dp/0735201811/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=0735201811',
    color: '#e67e22',
    hasImage: true,
  },
  {
    title: 'Trading for a Living',
    author: 'Alexander Elder',
    bestPrice: '$1.52',
    asin: '0471592242',
    url: 'https://www.amazon.com/dp/0471592242/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=0471592242',
    color: '#8b0000',
    hasImage: true,
  },
  {
    title: 'Getting Started in Technical Analysis',
    author: 'Jack D. Schwager',
    bestPrice: '$0.01',
    asin: '0471295426',
    url: 'https://www.amazon.com/dp/0471295426/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=0471295426',
    color: '#1e5a96',
    hasImage: true,
  },
  {
    title: 'Encyclopedia of Chart Patterns',
    author: 'Thomas N. Bulkowski',
    bestPrice: '$49.51',
    asin: '0471668265',
    url: 'https://www.amazon.com/dp/0471668265/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=0471668265',
    color: '#27ae60',
    hasImage: true,
  },
];

export default function RecommendedReadingPage() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: '#131722',
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#d1d4dc',
            marginBottom: '8px',
            fontFamily: 'Inter, sans-serif',
          }}>
            Recommended Reading
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#787b86',
            fontFamily: 'Inter, sans-serif',
          }}>
            Essential books for trading and technical analysis from industry experts.
          </p>
        </div>

        {/* Books Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '24px',
        }}>
          {readings.map((book) => (
            <a
              key={book.title}
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
                background: '#1e222d',
                borderRadius: '12px',
                border: `1px solid ${book.color}40`,
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = book.color;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${book.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${book.color}40`;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Book Cover Image or Placeholder */}
              {book.hasImage ? (
                <div style={{
                  width: '100%',
                  height: '220px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  overflow: 'hidden',
                  background: '#2a2e39',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img 
                    src={`https://images-na.ssl-images-amazon.com/images/P/${book.asin}.01.L.jpg`}
                    alt={book.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                    onError={(e) => {
                      const img = e.currentTarget;
                      const parent = img.parentElement;
                      const attempts = [
                        `https://m.media-amazon.com/images/P/${book.asin}.01.L.jpg`,
                        `https://images.amazon.com/images/P/${book.asin}.01.L.jpg`,
                        `https://images.amazon.com/images/P/${book.asin}.02.L.jpg`,
                        `https://images-eu.ssl-images-amazon.com/images/P/${book.asin}.01.L.jpg`,
                      ];
                      
                      // محاولة URLs مختلفة
                      let currentAttempt = parseInt(img.dataset.attempt || '0');
                      if (currentAttempt < attempts.length) {
                        img.src = attempts[currentAttempt];
                        img.dataset.attempt = (currentAttempt + 1).toString();
                      } else {
                        // إذا فشل كل شيء، عرض placeholder
                        if (parent) {
                          parent.innerHTML = `
                            <div style="
                              width: 100%;
                              height: 100%;
                              background: linear-gradient(135deg, ${book.color}30 0%, ${book.color}10 100%);
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border: 2px dashed ${book.color}60;
                            ">
                              <div style="text-align: center; color: ${book.color}; font-size: 48px; font-weight: 600;">📚</div>
                            </div>
                          `;
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '220px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  background: `linear-gradient(135deg, ${book.color}30 0%, ${book.color}10 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px dashed ${book.color}60`,
                }}>
                  <div style={{
                    textAlign: 'center',
                    color: book.color,
                    fontSize: '48px',
                    fontWeight: 600,
                  }}>
                    📚
                  </div>
                </div>
              )}

              {/* Book Info */}
              <h3 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#d1d4dc',
                marginBottom: '8px',
                fontFamily: 'Inter, sans-serif',
                lineHeight: '1.4',
                minHeight: '40px',
              }}>
                {book.title}
              </h3>

              <p style={{
                fontSize: '12px',
                color: '#787b86',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '12px',
                flex: 1,
              }}>
                {book.author}
              </p>

              {/* Price and Amazon Button */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <div style={{
                  fontSize: '12px',
                  color: '#00b894',
                  fontWeight: 600,
                }}>
                  Best Price {book.bestPrice}
                </div>

                <button style={{
                  padding: '8px 12px',
                  background: '#FF9900',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#000',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.3s ease',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FBB81C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FF9900';
                  }}>
                  Buy from Amazon
                </button>
              </div>

              {/* Privacy Info */}
              <div style={{
                fontSize: '11px',
                color: '#787b86',
                marginTop: '12px',
                borderTop: `1px solid #2a2e39`,
                paddingTop: '12px',
                display: 'block',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = book.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#787b86';
                }}
              >
                Privacy Information
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
