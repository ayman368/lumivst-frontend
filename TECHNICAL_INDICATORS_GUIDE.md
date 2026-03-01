# Frontend Integration Guide - المؤشرات التقنية الجديدة

## البيانات المتاحة الآن / Available Data Fields

جميع الحقول التالية متاحة الآن في استجابة API الـ `PriceResponse`:

```typescript
// New Technical Indicators
ema_21: Decimal                          // 21-Day Exponential Moving Average
sma_200_1m_ago: Decimal                 // 200MA قبل شهر واحد
sma_200_2m_ago: Decimal                 // 200MA قبل شهرين
sma_200_3m_ago: Decimal                 // 200MA قبل 3 أشهر
sma_200_4m_ago: Decimal                 // 200MA قبل 4 أشهر
sma_200_5m_ago: Decimal                 // 200MA قبل 5 أشهر
sma_30w: Decimal                        // 30-Week Simple Moving Average
sma_40w: Decimal                        // 40-Week Simple Moving Average

// Existing fields still available
sma_200: Decimal (via price_minus_sma_200 + calculation)
sma_150: Decimal (via price_minus_sma_150 + calculation)
sma_50: Decimal (via price_minus_sma_50 + calculation)
sma_21: Decimal (via price_minus_sma_21 + calculation)
sma_10: Decimal (via price_minus_sma_10 + calculation)
```

---

## مثال على الفلاتر الممكنة / Filter Examples

### 1. فلاتر 200MA الاتجاهية (Trend Filters)
```javascript
// 200MA في اتجاه صاعد - كل قيمة أعلى من السابقة
stock.sma_200_1m_ago > stock.sma_200_2m_ago &&
stock.sma_200_2m_ago > stock.sma_200_3m_ago &&
stock.sma_200_3m_ago > stock.sma_200_4m_ago &&
stock.sma_200_4m_ago > stock.sma_200_5m_ago
```

### 2. فلاتر المقارنة مع المتوسط الحالي
```javascript
// 200MA في اتجاه صاعد مقارنة بالأشهر الماضية
stock.sma_200 > stock.sma_200_1m_ago &&
stock.sma_200 > stock.sma_200_2m_ago &&
stock.sma_200 > stock.sma_200_3m_ago
```

### 3. فلاتر EMA مقابل SMA
```javascript
// 21 EMA فوق 50 SMA
stock.ema_21 > stock.price_minus_sma_50  // Note: price_minus_sma_50 يحتوي على قيمة SMA نفسها

// أو بصيغة أفضل إذا تم إضافة الحقول:
stock.ema_21 > stock.sma_50
```

### 4. فلاتر المتوسطات الأسبوعية
```javascript
// 30W SMA فوق 40W SMA
stock.sma_30w > stock.sma_40w

// أو المقارنة مع المتوسطات اليومية
stock.sma_30w > stock.sma_150  // تقريباً متطابقة
stock.sma_40w > stock.sma_200  // تقريباً متطابقة
```

---

## حالات خاصة / Edge Cases

### 1. قيم NULL
بعض الأسهم الجديدة قد تملك قيم `NULL` للحقول التالية:
- `sma_200_5m_ago` - إذا كان السهم موجوداً لأقل من 5 أشهر
- `sma_40w` - إذا كان السهم موجوداً لأقل من 40 أسبوع

**التوصية**: استخدم `?? 0` أو تجاهل الأسهم التي تملك قيم NULL

### 2. إزاحة البيانات (Data Lag)
- البيانات المحسوبة تتعلق بـ **آخر تاريخ متاح** في قاعدة البيانات
- إذا كانت آخر بيانات من أمس، فقيم `sma_200_1m_ago` ستمثل وضع اليوم من شهر ماضي (آخر يوم تداول معروف)

---

## نصائح الأداء / Performance Tips

1. **استخدم الفهارس**: تأكد من استخدام الفهارس عند الفلترة على هذه الحقول الجديدة
   ```sql
   CREATE INDEX idx_prices_ema_21 ON prices(ema_21);
   CREATE INDEX idx_prices_sma_200_1m ON prices(sma_200_1m_ago);
   ```

2. **تخزين مؤقت (Caching)**: بيانات المتوسطات المتحركة تتغير بسرعة أقل من الأسعار، يمكن تخزينها مؤقتاً

3. **استعلامات متعددة التصفية**:
   ```sql
   -- بدلاً من:
   WHERE ema_21 > sma_50 AND sma_200 > sma_200_1m_ago
   
   -- استخدم transaction scope لتقليل الحمل
   ```

---

## أمثلة كود للواجهة الأمامية / Frontend Code Examples

### React Component for MA Filtration
```jsx
const MAComparisonFilter = ({ stocks }) => {
  const filteredStocks = stocks.filter(stock => {
    // فلتر: 200MA في اتجاه صاعد قوي
    if (
      stock.sma_200_1m_ago && 
      stock.sma_200_2m_ago &&
      stock.sma_200_1m_ago > stock.sma_200_2m_ago &&
      stock.sma_200 > stock.sma_200_1m_ago
    ) {
      return true;
    }
    
    // فلتر: EMA فوق SMA
    if (
      stock.ema_21 && 
      stock.price_minus_sma_50 &&
      stock.ema_21 > stock.price_minus_sma_50
    ) {
      return true;
    }
    
    return false;
  });
  
  return (
    <div>
      <h2>Strong Uptrend Stocks</h2>
      {filteredStocks.map(stock => (
        <StockRow key={stock.symbol} stock={stock} />
      ))}
    </div>
  );
};
```

---

## اختبارات موصى بها / Recommended Tests

1. **اختبار البيانات الفارغة**:
   ```javascript
   expect(filterMA([])).toEqual([]);
   expect(filterMA(null)).toThrow();
   ```

2. **اختبار القيم الحدية**:
   ```javascript
   // ماذا يحدث عندما تكون جميع المتوسطات متساوية؟
   expect(filterMA({sma_200: 100, sma_200_1m_ago: 100})).toBeFalsy();
   ```

3. **اختبار الأداء**:
   ```javascript
   // اختبر الفلترة على 1000 سهم
   console.time('filter');
   const result = filterMA(largeStockList);
   console.timeEnd('filter');  // يجب أن يكون أقل من 100ms
   ```

---

## تحديثات API المتعلقة / Related API Endpoints

جميع الـ endpoints التالية ستعيد البيانات الجديدة:

- `GET /api/stocks/latest` - آخر أسعار مع المؤشرات الجديدة
- `GET /api/stocks/{symbol}/history` - الأسعار التاريخية مع المؤشرات
- `GET /api/screener/results` - نتائج الـ screener مع المؤشرات

---

## استثناءات قد تحدث / Potential Issues

⚠️ **Issue #1**: Decimal precision
- `Decimal` من Pydantic معامل بشكل مختلف عن `float`
- استخدم `.toString()` عند العرض أو المقارنة

⚠️ **Issue #2**: Timezone considerations
- التواريخ في `sma_200_1m_ago` قد تكون في timezone مختلف
- تأكد من المحاذاة الزمنية عند المقارنة

⚠️ **Issue #3**: Data consistency
- قد تكون بيانات سهم معين غير كاملة
- استخدم `?.` operator في TypeScript لضمان الأمان

