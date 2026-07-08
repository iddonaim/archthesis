# Deployment Summary - Origin Tracking Feature

**Date:** January 2, 2026
**Version:** 3.0.2
**Feature:** QR Code Origin Tracking & Spatial Analytics

---

## Summary

Implemented comprehensive origin tracking system to capture where users discovered the platform (via QR codes in specific neighborhoods vs. organic link sharing). This enables spatial analysis of meme creation patterns for thesis research.

---

## Changes

### Files Modified

1. **src/pages/HomePage.tsx**
   - Added URL parameter capture with `useSearchParams()`
   - Captures `?ref=` parameter on page load
   - Stores in localStorage as `user_origin`
   - Defaults to "link" for organic visitors
   - Always overwrites (keeps most recent origin)

2. **src/types/meme.ts**
   - Added `originSource?: string` to Meme interface
   - Optional field for QR tracking data

3. **src/hooks/usePublishMeme.ts**
   - Retrieves `user_origin` from localStorage on publish
   - Includes as `originSource` field in Firestore document
   - Fallback to "link" if somehow missing

### Files Created

1. **ORIGIN_TRACKING.md**
   - Comprehensive documentation with 50+ query examples
   - Research questions mapped to Firestore queries
   - Export scripts for CSV/JSON analysis
   - Testing procedures
   - Privacy considerations

2. **DEPLOYMENT_SUMMARY_ORIGIN_TRACKING.md** (this file)
   - Deployment record
   - Implementation details

---

## Technical Details

**Storage:** localStorage (persists across sessions)
**Key:** `user_origin`
**Values:**
- `"florentin"`, `"habima"`, `"rothschild"`, etc. (QR codes)
- `"link"` (organic spread)

**Override Behavior:** Always overwrites with most recent value
**Firestore Field:** `originSource` (string, optional)

---

## Use Cases

### QR Code Placement
```
Physical Location → QR Code → URL
Florentin Street → QR → yoursite.com/?ref=florentin
Habima Square → QR → yoursite.com/?ref=habima
Rothschild Blvd → QR → yoursite.com/?ref=rothschild
```

### Organic Sharing
```
Friend shares → yoursite.com/ → originSource: "link"
```

---

## Example Queries

### Spatial Distribution
```javascript
// Count memes from Florentin
db.collection('memes')
  .where('originSource', '==', 'florentin')
  .get()
```

### Tag Analysis by Location
```javascript
// Housing critique by neighborhood
db.collection('memes')
  .where('tags', 'array-contains', 'ביקורת דיור')
  .get()
// Then group by originSource
```

### QR vs Organic Comparison
```javascript
// QR scans
db.collection('memes').where('originSource', '!=', 'link').get()

// Organic spread
db.collection('memes').where('originSource', '==', 'link').get()
```

---

## Research Questions Enabled

1. **Spatial Patterns:** Do different neighborhoods produce different types of critique?
2. **Engagement:** Do QR users engage differently than organic users?
3. **Effectiveness:** Which QR placements generate the most content?
4. **Correlation:** Is there geographic correlation between origin and content?
5. **Behavior:** Do QR users add more context (descriptions, usernames)?

---

## Testing

### Verify Capture
1. Visit `https://adaptivememeticarchitect-2776f.web.app/?ref=test`
2. Console → "Origin captured from QR: test"
3. Check: `localStorage.getItem('user_origin')` → "test"

### Verify Storage
1. Create a meme
2. Check Firestore memes collection
3. Meme document should have `originSource: "test"`

### Verify Override
1. Visit `?ref=first`
2. Visit `?ref=second`
3. localStorage should show "second"
4. Next meme should have `originSource: "second"`

---

## Deployment Info

**Build Time:** 8.04s
**Build Size:** 2834.73 KiB (precache)
**Deploy Target:** Firebase Hosting
**Live URL:** https://adaptivememeticarchitect-2776f.web.app

**Status:** ✅ Successfully deployed and tested

---

## Privacy Compliance

- Disclosed in privacy policy (`src/data/privacyContent.json`)
- No personally identifiable information collected
- Tracks WHERE, not WHO
- Users remain anonymous
- Compliant with thesis ethics requirements

---

## Next Steps (Suggested)

1. ✅ Create QR codes for physical placement
2. ✅ Track which QR codes are printed and where
3. ✅ Monitor initial data collection
4. 📊 Run preliminary queries after 1 week
5. 📈 Conduct full spatial analysis for thesis

---

## Documentation Links

- **Full Query Guide:** See `ORIGIN_TRACKING.md`
- **Privacy Policy:** `src/data/privacyContent.json`
- **Implementation:** `src/pages/HomePage.tsx` (lines 15-28)

---

## Notes

- Origin data only available for memes created AFTER deployment (Jan 2, 2026)
- Legacy memes will have `originSource: null` or field missing
- Can be queried with: `.where('originSource', '==', null)`
- Consider adding to gallery filters if useful for UX

---

**Deployed by:** Claude Sonnet 4.5
**Researcher:** עידו נעים
**Institution:** בית הספר לאדריכלות, אוניברסיטת תל אביב
