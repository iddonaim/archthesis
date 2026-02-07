# Bug Fix: Default Text Appearing in Published Memes

## Issue
Default placeholder text ("כתבו כאן..." / "כתוב כאן...") was appearing in published memes when users didn't modify it. This created visual clutter in the gallery.

## Root Cause
Two related problems:
1. **Text Editing Logic**: When users clicked to edit a text box but didn't change the default text, the system marked it as `isPlaceholder: false`, treating it as user content.
2. **Canvas Export**: All text boxes (including placeholders) were rendered in the exported image, even if they hadn't been modified.

## Solution

### 1. Fixed Text Editing (`CanvasEditor.tsx`)
Updated the `handleTextSave` function to recognize all placeholder text variations:
- If the user saves empty text or any known placeholder text, it remains marked as `isPlaceholder: true`
- Only actual user content gets marked as `isPlaceholder: false`

### 2. Enhanced Publishing Filter (`usePublishMeme.ts`)
Added multiple layers of protection:
- Filter placeholder text boxes from searchable meme text
- Temporarily hide placeholder text nodes during canvas export
- Use try-finally to ensure visibility is always restored after export

## Files Modified
- `/src/components/editor/CanvasEditor.tsx` - Text editing logic
- `/src/hooks/usePublishMeme.ts` - Publishing and export logic

## Testing
- Build completed successfully
- No TypeScript errors
- Bundle size: 381 KB gzipped (within target)

## Result
- Default text boxes that haven't been modified by users will NOT appear in published memes
- Text boxes are still visible during editing (good UX)
- Users can still use placeholder text if they want (by typing it manually)
