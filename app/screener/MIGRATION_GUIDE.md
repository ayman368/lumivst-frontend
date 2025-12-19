# Screener API Migration Guide

## Current State (Mock Data)
Currently, the screener is operating in **Mock Mode**.
- Checks `useScreener.ts` line 17: `const USE_MOCK_DATA = true;`
- Data is loaded from `d:\Work\LUMIVST\frontend\app\screener\utils\screenerData.ts`
- Filtering and sorting happen **Client-Side** inside `useScreener.ts`.

## How to Switch to Real API (Backend Ready)

When your Backend and API are ready to handle requests:

1. **Update `useScreener.ts`**:
   - Change `USE_MOCK_DATA` to `false`.
   - Uncomment the `fetchRealData` function.
   - Ensure the `useEffect` calls `fetchRealData()` instead of the mock logic.

2. **Verify API Endpoint**:
   - The frontend expects an endpoint at `POST /api/screener` (or your actual backend URL).
   - This endpoint is currently mocked in `d:\Work\LUMIVST\frontend\app\api\screener\route.ts`.
   - You should verify that `lib/api/screener.ts` points to the correct URL.

3. **Backend Requirements**:
   - The backend should accept a POST request with this body structure:
     ```json
     {
       "filters": { "marketCap": "mega", "sector": "Technology", ... },
       "sort": { "key": "price", "direction": "asc" },
       "search": "AAPL"
     }
     ```
   - The backend should return:
     ```json
     {
       "data": [ ...list of stocks... ],
       "total": 100
     }
     ```

## What to Remove Later
- Once fully integrated, you can delete:
  - `d:\Work\LUMIVST\frontend\app\screener\utils\screenerData.ts` (The mock data file)
  - `d:\Work\LUMIVST\frontend\app\api\screener\route.ts` (If you are pointing to an external backend like Python/Go/Node separate service, otherwise keep this as a proxy).
