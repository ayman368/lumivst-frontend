'use client';

import { motion } from 'framer-motion';

const readings = [
  {
    title: 'Momentum Masters - A Roundtable Insight',
    author: 'Mark Minervini, Bo...',
    bestPrice: '$27.00',
    asin: '0996307907',
    isbn: '9780996307901',
    url: 'https://www.amazon.com/dp/0996307907/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=0996307907',
    localImage: '/images/recommended-readingpage/Momentum Masters.jpg',
  },
  {
    title: 'How to Make Money in Stocks',
    author: "William O'Neil",
    bestPrice: '$4.50',
    asin: '0071614133',
    isbn: '9780071614139',
    url: 'https://www.amazon.com/gp/product/B001929QGW/ref=as_li_tl?ie=UTF8&tag=chartpatter0b-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B001929QGW',
  },
  {
    title: 'Reminiscences of a Stock Operator',
    author: 'Edwin Lefèvre, Ro...',
    bestPrice: '$4.99',
    asin: '0471770884',
    isbn: '9780471770886',
    url: 'https://www.amazon.com/dp/0471770884/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=0471770884',
  },
  {
    title: 'How Technical Analysis Works',
    author: 'Bruce M. Kamich',
    bestPrice: '$31.21',
    asin: '0735202702',
    isbn: '9780735202702',
    url: 'https://www.amazon.com/dp/0735202702/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=0735202702',
  },
  {
    title: 'How I Made $2,000,000 in the Stock Market',
    author: 'Nicolas Darvas',
    bestPrice: '$3.98',
    asin: '1578988446',
    isbn: '9781578988440',
    url: 'https://www.amazon.com/dp/1578988446/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=1578988446',
  },
  {
    title: 'Japanese Candlestick Charting Techniques',
    author: 'Steve Nison',
    bestPrice: '$43.76',
    asin: '0735201811',
    isbn: '9780735201811',
    url: 'https://www.amazon.com/dp/0735201811/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=0735201811',
  },
  {
    title: 'Trading for a Living',
    author: 'Alexander Elder',
    bestPrice: '$1.52',
    asin: '0471592242',
    isbn: '9780471592242',
    url: 'https://www.amazon.com/dp/0471592242/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=0471592242',
  },
  {
    title: 'Getting Started in Technical Analysis',
    author: 'Jack D. Schwager',
    bestPrice: '$0.01',
    asin: '0471295426',
    isbn: '9780471295426',
    url: 'https://www.amazon.com/dp/0471295426/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=0471295426',
  },
  {
    title: 'Encyclopedia of Chart Patterns',
    author: 'Thomas N. Bulkowski',
    bestPrice: '$49.51',
    asin: '0471668265',
    isbn: '9780471668268',
    url: 'https://www.amazon.com/dp/0471668265/ref=as_sl_pc_tf_lc?tag=chartpatter0b-20&camp=14573&creative=327641&linkCode=as1&creativeASIN=0471668265',
    localImage: '/images/recommended-readingpage/Encyclopedia of Chart Patterns.jpg',
  },
];

function getImageUrls(asin: string, isbn: string, localImage?: string): string[] {
  const urls = [];
  if (localImage) urls.push(localImage);
  urls.push(
    `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`,
    `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.L.jpg`,
    `https://m.media-amazon.com/images/P/${asin}.01.L.jpg`,
    `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
    `https://books.google.com/books/content?vid=ISBN${isbn}&printsec=frontcover&img=1&zoom=1`
  );
  return urls;
}

function BookCard({ book, index }: { book: typeof readings[0] & { localImage?: string }; index: number }) {
  const imageUrls = getImageUrls(book.asin, book.isbn, book.localImage);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const attempt = parseInt(img.dataset.attempt || '0');
    if (attempt < imageUrls.length - 1) {
      img.dataset.attempt = (attempt + 1).toString();
      img.src = imageUrls[attempt + 1];
    } else {
      const parent = img.parentElement;
      if (parent) {
        parent.innerHTML = `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#EDE8DC;gap:8px;padding:12px;box-sizing:border-box;">
          <span style="font-size:40px;">📚</span>
          <span style="font-size:11px;color:#A09880;text-align:center;">${book.title}</span>
        </div>`;
      }
    }
  };

  return (
    <motion.a
      href={book.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#2962FF';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(41,98,255,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E5E7EB';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}
    >
      <div style={{
        width: '100%', height: '400px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <img
          src={imageUrls[0]}
          alt={book.title}
          data-attempt="0"
          onError={handleError}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', lineHeight: 1.4, margin: 0, minHeight: '40px' }}>
          {book.title}
        </h3>
        <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0, flex: 1 }}>
          {book.author}
        </p>

        <div style={{ paddingTop: '8px', borderTop: '1px solid #E5E7EB' }}>
          <button
            style={{
              width: '100%', padding: '8px 12px',
              backgroundColor: '#FF9900', border: 'none', borderRadius: '8px',
              color: '#000', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FBB81C'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FF9900'; }}
          >
            Buy from Amazon
          </button>
        </div>
      </div>
    </motion.a>
  );
}

export default function RecommendedReadingPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', backgroundColor: '#FFFFFF', color: '#111827', fontFamily: 'system-ui, sans-serif' }}>

      <div style={{ padding: '40px 32px 32px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#111827', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ padding: '3px 12px', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#D1D5DB', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.2)' }}>
              Education • Books
            </span>
          </div>
          <h1 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-0.02em', color: '#F9FAFB', marginBottom: '8px' }}>
            Recommended <span style={{ color: '#D1D5DB' }}>Reading</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', maxWidth: '480px', lineHeight: 1.6, margin: 0 }}>
            Essential books for trading and technical analysis from industry experts.
          </p>
        </div>
      </div>

      <div style={{ padding: '40px 32px 80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {readings.map((book, index) => (
              <BookCard key={book.asin} book={book} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}