# Translation Master Document - Hebrew to English
**Project:** Archthesis React - Meme Generator
**Total Strings:** ~680 user-facing text instances
**Purpose:** Complete bilingual implementation (Hebrew/English)

---

## Translation Guidelines

### Tone & Voice
- **Hebrew (Original):** Informal, playful, academic-casual mix, uses humor ("גיחוך")
- **English (Target):** Maintain playful academic tone, keep humor, preserve cultural nuance

### Special Terminology
- **גיחוך (Gichuch)** = "Laugh" / "Meme" / "Gigglechitecture" (portmanteau)
  - Suggested translations depend on context:
    - Button/Action: "Create Meme" (simple, clear)
    - Brand/Title: "Gigglechitecture" or "ArchMeme" (playful)
    - Gallery: "Memes" (standard)

### Key Principles
1. Keep academic credibility (this is a thesis project)
2. Preserve humor and playfulness
3. Maintain right-to-left (RTL) support for Hebrew
4. Variable placeholders must remain intact: `${variable}`, `{variable}`
5. Icon components don't need translation

---

## 1. BRANDING & CORE CONCEPTS

| Category | Hebrew | English Translation | Notes |
|----------|--------|---------------------|-------|
| **Brand Name** | מכונת הגיחוך וההגחה | The Gigglechitecture Machine | Portmanteau: Gichuch (laugh) + Architecture |
| **Tagline (short)** | גחך על העיר | Laugh at the City | Hero section |
| **Tagline (long)** | פלטפורמה ליצירת ממים על המרחב הבנוי | Platform for Creating Memes About the Built Environment | Homepage subtitle |
| **Project Type** | פרויקט גמר באדריכלות | Architecture Thesis Project | Academic context |
| **Institution** | אוניברסיטת תל אביב | Tel Aviv University | - |
| **Creator** | עידו נעים | Ido Naim | - |

---

## 2. NAVIGATION & LAYOUT

### Header Navigation
| Hebrew | English | Path | Icon |
|--------|---------|------|------|
| דף הבית | Home | / | Home |
| גלריה | Gallery | /gallery | Image |
| צור גיחוך | Create Meme | /create | Plus |
| ניהול | Admin | /admin | Shield |

### Footer Sections
| Hebrew | English | Context |
|--------|---------|---------|
| **גיחוך והגחה** | **Gigglechitecture** | Brand heading |
| פלטפורמה לביקורת אדריכלית דרך יצירת ממים | Platform for architectural critique through meme creation | Brand description |
| הפכו תצפיות לממים, וממים לשינוי אמיתי! | Turn observations into memes, and memes into real change! | Call to action |
| **ניווט** | **Navigation** | Section heading |
| **משפטי** | **Legal** | Section heading |
| **פרטים** | **Details** | Section heading |
| פרטיות | Privacy | Link |
| תנאי שימוש | Terms of Service | Link |
| יצירת קשר | Contact | Button |
| פרויקט גמר באדריכלות | Architecture Thesis Project | Footer info |
| יוצר: עידו נעים | Created by: Ido Naim | Footer credit |
| נבנה עם Claude (Anthropic) - Sonnet 4.5 | Built with Claude (Anthropic) - Sonnet 4.5 | Tech credit |
| כל הזכויות שמורות | All rights reserved | Copyright |
| גרסה {version} • {date} | Version {version} • {date} | Version display |

---

## 3. HOMEPAGE CONTENT

### Hero Section
| Hebrew | English | Context |
|--------|---------|---------|
| מגחכים על העיר | Laughing at the City | Main heading (v3.3.6) |
| יוצרים מם ומשפיעים על המרחב העירוני | Create memes and influence the urban space | Subtitle line 1 (v3.3.6) |
| אם אפשר לצחוק על המרחב שבו אנחנו חיים, אפשר גם לדבר עליו, לבקר אותו ואולי אפילו לשנות אותו! | If we can laugh at the space we live in, we can also talk about it, critique it, and maybe even change it! | Subtitle line 2 (v3.3.6) |
| צור גיחוך חדש | Create New Meme | Primary CTA |
| לגלריית הגיחוכים | To Meme Gallery | Secondary CTA (v3.3.6) |
| מה קורה כאן? | What's Going On Here? | Info CTA |

### How It Works Section (3 Compact Step Cards - v3.3.6)
| Hebrew | English | Context |
|--------|---------|---------|
| **1️⃣ מסתכלים מסביב** | **1️⃣ Look Around** | Step 1 title (v3.3.6) |
| מעלים תמונה שצילמתם בעיר, או בוחרים תבנית מם מהמאגר | Upload a photo you took in the city, or choose a meme template from the collection | Step 1 content (v3.3.6) |
| **2️⃣ אומרים משהו** | **2️⃣ Say Something** | Step 2 title (v3.3.6) |
| מוסיפים את האמירה שלכם עם טקסט, אימוג'י, תיאור, תגיות ומיקום | Add your statement with text, emoji, description, tags and location | Step 2 content |
| **3️⃣ משתפים ומשפיעים!** | **3️⃣ Share and Influence!** | Step 3 title (v3.3.6) |
| הכנתם מם? שתפו אותו - הפעם השיתוף שלכם יכול להשפיע על המרחב! | Made a meme? Share it - this time your sharing can influence the space! | Step 3 content (v3.3.6) |

### Latest Memes Section
| Hebrew | English |
|--------|---------|
| גיחוכים אחרונים מהקהילה | Latest Memes from the Community |

### What's Happening Section Intro (v3.3.6)
| Hebrew | English | Context |
|--------|---------|---------|
| מה קורה כאן? | What's Going On Here? | Section heading |
| האתר הזה נולד מתוך הרעיון שממים הם לא רק בדיחה — הם כלי תקשורת, ביקורת, הפצה והשתתפות. כאן אנחנו מנסים להשתמש בהם כדי לדבר על המרחב, על אדריכלות ועל איך היא נראית, מרגישה ומתפקדת בחיים האמתיים. | This website was born from the idea that memes aren't just jokes — they're tools for communication, critique, distribution and participation. Here we're trying to use them to talk about space, about architecture, and how it looks, feels and functions in real life. | Intro paragraph (v3.3.6) |
| *פרויקט גמר באדריכלות, אוניברסיטת תל־אביב | *Architecture thesis project, Tel Aviv University | Academic note (v3.3.6) |

### Info Cards Section (4-Card Grid - v3.3.6)

**Card 1: What Do We Do?**
| Hebrew | English |
|--------|---------|
| אז מה עושים? | So What Do We Do? |
| יוצרים מם על המרחב או בעזרתו - מעלים תמונה או בוחרים תבנית, מוסיפים טקסט, אימוג׳י ותגיות (האשטאגים), וכמובן... משתפים! | Create a meme about space or with its help - upload a photo or choose a template, add text, emojis and tags (hashtags), and of course... share! |

**Card 2: Everyone is Invited!**
| Hebrew | English |
|--------|---------|
| כולם מוזמנים להשתתף! | Everyone is Invited to Participate! |
| באמת כולם - כל מי שמרגיש שיש לו מה להגיד על העיר יכול לתרום. לא צריך ידע מוקדם - רק עין חדה, וקצת חוש הומור! | Really everyone - anyone who feels they have something to say about the city can contribute. No prior knowledge needed - just a sharp eye, and a bit of humor! |

**Card 3: Why Does It Matter?**
| Hebrew | English |
|--------|---------|
| למה זה משנה? | Why Does It Matter? |
| המרחב הבנוי משפיע על כולנו, אבל רוב הזמן השיח עליו סגור בידי מומחים. הפרויקט בוחן כיצד ממים יכולים לפתוח את השיח הזה — ולאפשר ביקורת נגישה, ישירה ומשתתפת. | The built environment affects us all, but most of the time discourse about it is closed to experts. The project examines how memes can open this discourse — and enable accessible, direct, and participatory critique. |

**Card 4: What Happens with the Data?**
| Hebrew | English |
|--------|---------|
| מה קורה עם המידע? | What Happens with the Data? |
| זהו מחקר אקדמי. כל המידע נאסף באופן אנונימי למטרות מחקר בלבד. לפרטים מלאים ראו את | This is academic research. All information is collected anonymously for research purposes only. For full details see |
| מדיניות הפרטיות | Privacy Policy |

**Contact Button**
| Hebrew | English |
|--------|---------|
| יש לכם שאלות? צרו קשר | Have Questions? Contact Us |

### Final CTA Section
| Hebrew | English |
|--------|---------|
| מוכנים להתחיל? | Ready to Start? |
| צרו את הממ הראשון שלכם | Create Your First Meme |

---

## 4. GALLERY PAGE

### Page Header
| Hebrew | English | Context |
|--------|---------|---------|
| גלריית הגיחוכים | Meme Gallery | Page heading |
| {filteredCount} מתוך {totalCount} גיחוכים | {filteredCount} of {totalCount} memes | Results counter |
| נמצאו {count} תוצאות | Found {count} results | Search results |

### Search & Filter
| Hebrew | English | Context |
|--------|---------|---------|
| חיפוש בגלריה | Search Gallery | Label |
| חפשו לפי טקסט על הממ, תיאור, תגיות, מיקום או שם משתמש | Search by text on meme, description, tags, location or username | Description |
| חיפוש... | Search... | Placeholder |
| **סינון לפי תגיות:** | **Filter by Tags:** | Filter section |
| נקה הכל ({count}) | Clear All ({count}) | Clear filters button |

### Sorting
| Hebrew | English | Context |
|--------|---------|---------|
| מיון: | Sort: | Label |
| חדשים ביותר | Most Recent | Sort option |
| פופולריים ביותר | Most Popular | Sort option |
| ישנים ביותר | Oldest | Sort option |

### States
| Hebrew | English | Context |
|--------|---------|---------|
| טוען גיחוכים... | Loading memes... | Loading state |
| אופס! משהו השתבש | Oops! Something went wrong | Error heading |
| שגיאה בטעינת הגיחוכים. נסו לרענן את הדף. | Error loading memes. Try refreshing the page. | Error message |
| רענן את הדף | Refresh Page | Error button |

---

## 5. CREATE PAGE (EDITOR)

### Page Headers
| Hebrew | English | Context |
|--------|---------|---------|
| בחרו תבנית | Choose Template | When no image selected |
| עורך הגיחוכים | Meme Editor | When editing |
| טוען גיחוך... | Loading meme... | Loading remix |

### Template Selection
| Hebrew | English | Context |
|--------|---------|---------|
| **העלו תמונה משלכם** | **Upload Your Own Image** | Upload card heading |
| לחצו כאן כדי לבחור תמונה מהמחשב | Click here to choose an image from your computer | Upload description |
| **או בחרו תבנית קיימת** | **Or Choose an Existing Template** | Divider text |
| כתבו כאן... | Write here... | Default text placeholder |

### Top Buttons
| Hebrew | English | Context |
|--------|---------|---------|
| החלף תמונה | Change Image | For custom uploads |
| בחר תבנית אחרת | Choose Different Template | - |
| התחל מחדש | Start Over | With confirm dialog |
| האם אתה בטוח? כל השינויים יימחקו | Are you sure? All changes will be deleted | Confirm dialog |

### Editor Tabs
| Hebrew | English | Icon |
|--------|---------|------|
| טקסט | Text | Type |
| אמוג׳י | Emoji | Smile |
| מיקום | Location | MapPin |
| תגיות | Tags | Tag |

### Text Panel
| Hebrew | English | Context |
|--------|---------|---------|
| **תיאור הגיחוך (אופציונלי)** | **Meme Description (Optional)** | Section label |
| הוסף תיאור לגיחוך שלך... | Add a description to your meme... | Textarea placeholder |
| {count}/200 | {count}/200 | Character counter |
| הוסף טקסט לקנבס | Add Text to Canvas | Button |
| לחצו פעמיים על טקסט בקנבס כדי לערוך אותו | Double-click text on canvas to edit it | Help text |

### Emoji Panel
| Hebrew | English | Context |
|--------|---------|---------|
| **אמוג'י** | **Emoji** | Heading |
| פרצופים | Faces | Category |
| מחוות | Gestures | Category |
| חיות | Animals | Category |
| אוכל | Food | Category |
| אובייקטים | Objects | Category |
| סמלים | Symbols | Category |
| לחצו על אמוג'י כדי להוסיף אותו לתמונה | Click emoji to add it to the image | Help text |

### Location Panel
| Hebrew | English | Context |
|--------|---------|---------|
| **מיקום ושם משתמש** | **Location and Username** | Heading |
| **שם משתמש (אופציונלי)** | **Username (Optional)** | Label |
| הזינו שם משתמש... | Enter username... | Input placeholder |
| השם יופיע בגלריה מתחת לגיחוך שלכם | The name will appear in the gallery below your meme | Help text |
| **מיקום** | **Location** | Subheading |
| מאתר... | Locating... | Loading state |
| המיקום שלי | My Location | Button (geolocation) |
| **חיפוש מיקום** | **Search Location** | Label |
| הקלד שם עיר, רחוב או מקום... | Type city name, street or place... | Search input placeholder |
| **מיקום מותאם אישית** | **Custom Location** | Label |
| הזן טקסט מיקום כלשהו... | Enter any location text... | Custom input placeholder |
| הוסף | Add | Button |
| הזן טקסט חופשי שיוצג כמיקום (ללא קואורדינטות GPS) | Enter free text to display as location (without GPS coordinates) | Help text |
| לא נמצאו תוצאות | No results found | Search empty state |
| **מיקום נבחר** | **Selected Location** | Label |
| על הגיחוך: | On the meme: | Preview label |
| הסר מיקום | Remove location | Button title |
| **הוסף מיקום לתמונה** | **Add location to image** | Checkbox label |
| המיקום יופיע על התמונה (ניתן לגרור ולשנות גודל) | Location will appear on the image (can drag and resize) | Checkbox description |
| **הצג בגלריה** | **Show in gallery** | Checkbox label |
| המיקום יופיע מתחת לגיחוך בגלריה | Location will appear below meme in gallery | Checkbox description |
| **הסתר מהגלריה, לשימוש מחקרי בלבד** | **Hide from gallery, for research use only** | Checkbox label |
| המיקום יהיה זמין רק בקונסול הניהול | Location will only be available in admin console | Checkbox description |

### Location Panel Errors
| Hebrew | English | Context |
|--------|---------|---------|
| הדפדפן שלך לא תומך במיקום | Your browser doesn't support geolocation | Alert |
| שגיאה באיתור המיקום | Error locating position | Alert |
| לא ניתן לקבל את המיקום שלך | Cannot get your location | Geolocation error |

### Tags Panel
| Hebrew | English | Context |
|--------|---------|---------|
| **תגיות** | **Tags** | Heading |
| **תגיות נבחרות ({count}/3):** | **Selected Tags ({count}/3):** | Label with counter |
| לא נבחרו תגיות עדיין | No tags selected yet | Empty state |
| **תגיות נפוצות:** | **Popular Tags:** | Label |
| תגית מותאמת אישית... | Custom tag... | Input placeholder |
| **תגיות דומות:** | **Similar Tags:** | Suggestions label |
| הוסף תגית | Add Tag | Button |
| הקלידו לפחות 2 תווים לקבלת הצעות | Type at least 2 characters for suggestions | Help text |
| ניתן להוסיף עד 3 תגיות | You can add up to 3 tags | Alert (limit reached) |

### Common Tags (12 architecture-specific)
| Hebrew | English |
|--------|---------|
| אדריכלות | Architecture |
| תכנון עירוני | Urban Planning |
| מרחב ציבורי | Public Space |
| בניה | Construction |
| שיפוץ | Renovation |
| נוף עירוני | Urban Landscape |
| תשתיות | Infrastructure |
| דיור | Housing |
| גינון | Landscaping |
| עיצוב | Design |
| היסטוריה | History |
| מודרניזם | Modernism |

### Color Panel
| Hebrew | English | Context |
|--------|---------|---------|
| **צבעים** | **Colors** | Heading |
| בחרו טקסט כדי לשנות צבעים | Select text to change colors | No selection message |
| **צבע טקסט:** | **Text Color:** | Label |
| **צבע מתאר:** | **Outline Color:** | Label |
| **עובי מתאר: {width}px** | **Outline Width: {width}px** | Label with dynamic value |
| **צבע רקע:** | **Background Color:** | Label |
| שקוף | Transparent | Button title |

### Publish Button
| Hebrew | English | Context |
|--------|---------|---------|
| מפרסם... | Publishing... | Loading state |
| פרסם גיחוך | Publish Meme | Normal state |

### Validation & Alerts
| Hebrew | English | Context |
|--------|---------|---------|
| אנא המתן עד שהעורך יהיה מוכן | Please wait until the editor is ready | Alert |
| שגיאה בפרסום: {error} | Error publishing: {error} | Alert with dynamic error |
| נא לבחור קובץ תמונה | Please select an image file | File type validation |
| גודל הקובץ ({size}MB) חורג מהמקסימום המותר (20MB).\nנא לבחור תמונה קטנה יותר. | File size ({size}MB) exceeds maximum allowed (20MB).\nPlease choose a smaller image. | File size validation |

### Navigation Dialogs

**Unsaved Work Dialog**
| Hebrew | English | Context |
|--------|---------|---------|
| רגע, יש לך גיחוך בעבודה! | Wait, you have a meme in progress! | Modal title |
| מה תרצה לעשות עם הגיחוך שלך? | What would you like to do with your meme? | Modal question |
| מפרסם... | Publishing... | Button loading |
| פרסם גיחוך | Publish Meme | Button |
| מחק והמשך | Delete and Continue | Button |
| בטל | Cancel | Button |

**Change Template Dialog**
| Hebrew | English | Context |
|--------|---------|---------|
| החלפת תבנית | Change Template | Modal title |
| מה תרצה לעשות עם העריכות הנוכחיות? | What would you like to do with current edits? | Modal question |
| שמור והחלף תבנית | Save and Change Template | Button |
| התחל מחדש (מחק הכל) | Start Over (Delete All) | Button |
| ביטול | Cancel | Button |

**Change Image Dialog**
| Hebrew | English | Context |
|--------|---------|---------|
| החלפת תמונה | Change Image | Modal title |
| מה תרצה לעשות עם העריכות הנוכחיות? | What would you like to do with current edits? | Modal question |
| שמור והעלה תמונה חדשה | Save and Upload New Image | Button |
| התחל מחדש (מחק הכל) | Start Over (Delete All) | Button |
| ביטול | Cancel | Button |

---

## 6. CONSENT MODAL

| Hebrew | English | Context |
|--------|---------|---------|
| **רגע לפני שמתחילים לגחך...** | **Before We Start Meme-ing...** | Modal heading |
| האתר הזה הוא חלק מפרויקט גמר באדריכלות באוניברסיטת תל-אביב. | This website is part of an architecture thesis project at Tel Aviv University. | Intro paragraph |
| המטרה: לבדוק איך ממים יכולים לשנות את הדרך שבה אנחנו רואים את העיר.\nההשתתפות שלכם עוזרת לפתח שפה ויזואלית חדשה לדיון על המרחב. | The goal: to examine how memes can change the way we see the city.\nYour participation helps develop a new visual language for discussing space. | Description paragraph |
| **איך זה עובד?** | **How Does It Work?** | Section heading |
| **1** מצלמים את המקום סביבכם או בוחרים מתוך תבנית קיימת | **1** Photograph your surroundings or choose from an existing template | Step 1 |
| **2** מוסיפים את האמירה שלכם עם טקסט, אימוג'י, תיאור, תגיות ומיקום | **2** Add your statement with text, emoji, description, tags and location | Step 2 |
| **3** מפרסמים לגלריה הציבורית (גלוי לכולם) | **3** Publish to public gallery (visible to everyone) | Step 3 |
| קראתי ואני מאשר/ת את | I have read and approve | Checkbox label |
| תנאי השימוש ומדיניות הפרטיות | Terms of Service and Privacy Policy | Link text |
| הבנתי, אפשר להתקדם | I Understand, Let's Proceed | Button |

---

## 7. SUCCESS MODAL (After Publishing)

| Hebrew | English | Context |
|--------|---------|---------|
| 🎉 הגיחוך פורסם בהצלחה! | 🎉 Meme Published Successfully! | Modal title |
| הממ שלך נוסף לגלריה | Your meme has been added to the gallery | Success message |
| שתף | Share | Button |
| הורד | Download | Button |
| לגלריה | To Gallery | Button |
| צור עוד | Create More | Button |

### Web Share API
| Hebrew | English | Context |
|--------|---------|---------|
| הגיחוך שלי | My Meme | Share title |
| צפו בגיחוך שיצרתי! | Check out the meme I created! | Share text |
| הקישור הועתק ללוח! | Link copied to clipboard! | Fallback alert |
| אין אפשרות לשתף במכשיר זה | Cannot share on this device | Error alert |

---

## 8. CONTACT MODAL

| Hebrew | English | Context |
|--------|---------|---------|
| 📧 יצירת קשר | 📧 Contact | Modal title |
| **שם (אופציונלי):** | **Name (Optional):** | Label |
| השאר ריק לאנונימיות | Leave blank for anonymity | Placeholder |
| **אימייל (אופציונלי):** | **Email (Optional):** | Label |
| אם תרצה תשובה | If you want a response | Placeholder |
| **הודעה:*** | **Message:*** | Label (required) |
| שאלה, הצעה, או כל דבר אחר... | Question, suggestion, or anything else... | Placeholder |
| ביטול | Cancel | Button |
| ⏳ שולח... | ⏳ Sending... | Button loading |
| 📤 שלח | 📤 Send | Button |
| אנונימי | Anonymous | Default name value |
| נא למלא הודעה | Please fill in a message | Validation error |
| ✅ ההודעה נשלחה בהצלחה! תודה שיצרת קשר. | ✅ Message sent successfully! Thank you for contacting us. | Success alert |
| שגיאה בשליחת ההודעה. נסה שוב. | Error sending message. Try again. | Error alert |

---

## 9. MEME CARD (Gallery Item)

### Action Buttons
| Hebrew | English | Icon |
|--------|---------|------|
| רמיקס | Remix | Shuffle |
| הורד | Download | Download |
| שתף | Share | Share2 |

### Toast Messages
| Hebrew | English | Context |
|--------|---------|---------|
| הגיחוך הורד בהצלחה! | Meme downloaded successfully! | Success |
| שגיאה בהורדת הגיחוך: {error} | Error downloading meme: {error} | Error |
| הגיחוך שותף בהצלחה! | Meme shared successfully! | Success |
| שגיאה בשיתוף הגיחוך | Error sharing meme | Error |
| הקישור הועתק ללוח! | Link copied to clipboard! | Clipboard |

### Error Messages (Like/Dislike)
| Hebrew | English | Error Code |
|--------|---------|------------|
| שגיאה בעדכון הלייק | Error updating like | Default |
| שגיאה: אין הרשאה לעדכן לייק | Error: No permission to update like | permission-denied |
| הגיחוך נמחק | Meme was deleted | not-found |
| שגיאת רשת. נסה שוב | Network error. Try again | unavailable |

### Web Share
| Hebrew | English | Context |
|--------|---------|---------|
| גיחוך מגניב! | Cool meme! | Share title |

---

## 10. LIGHTBOX (Full-Screen Meme View)

| Hebrew | English | Context |
|--------|---------|---------|
| סגור | Close | Button aria-label |
| הקודם | Previous | Button aria-label |
| הבא | Next | Button aria-label |
| הורד | Download | Button |
| שתף | Share | Button |
| הגיחוך הורד בהצלחה! | Meme downloaded successfully! | Toast |
| שגיאה בהורדת גיחוך: {error} | Error downloading meme: {error} | Toast |
| גיחוך מגניב! | Cool meme! | Share title |
| הקישור הועתק ללוח! | Link copied to clipboard! | Alert |

---

## 11. ADMIN PAGES

### Admin Login Page

| Hebrew | English | Context |
|--------|---------|---------|
| **חזרה לדף הבית** | **Back to Home** | Top button |
| **כניסה לפאנל הניהול** | **Admin Panel Login** | Page heading |
| מכונת הגיחוך וההגחה | The Gigglechitecture Machine | Subtitle |
| **אימייל** | **Email** | Label |
| **סיסמה** | **Password** | Label |
| מתחבר... | Logging in... | Button loading |
| התחבר | Login | Button |
| חזרה לדף הבית | Back to Home | Link |
| דף זה מוגן ומיועד למנהלי המערכת בלבד | This page is protected and intended for system administrators only | Security notice |

### Login Toast Messages
| Hebrew | English | Context |
|--------|---------|---------|
| התחברת בהצלחה! | Logged in successfully! | Success |
| שגיאה בהתחברות. נסה שוב. | Error logging in. Try again. | Default error |
| אימייל או סיסמה שגויים | Invalid email or password | auth/invalid-credential |
| משתמש לא נמצא | User not found | auth/user-not-found |
| סיסמה שגויה | Wrong password | auth/wrong-password |
| יותר מדי ניסיונות. נסה שוב מאוחר יותר | Too many attempts. Try again later | auth/too-many-requests |
| בעיית חיבור לאינטרנט | Internet connection problem | auth/network-request-failed |

### Admin Dashboard

| Hebrew | English | Context |
|--------|---------|---------|
| **פאנל ניהול** | **Admin Panel** | Page heading |
| מחובר כ: {email} • {version} ({date}) | Logged in as: {email} • {version} ({date}) | User info |
| התנתק | Logout | Button |
| התנתקת בהצלחה | Logged out successfully | Toast |
| שגיאה בהתנתקות | Error logging out | Toast |

### Admin Tabs
| Hebrew | English | Icon |
|--------|---------|------|
| סטטיסטיקות | Statistics | BarChart3 |
| ניהול גיחוכים | Manage Memes | Image |
| הודעות קשר | Contact Messages | Mail |

---

## 12. ADMIN - ANALYTICS

| Hebrew | English | Context |
|--------|---------|---------|
| טוען נתונים סטטיסטיים... | Loading statistics... | Loading message |
| **סטטיסטיקות** | **Statistics** | Page heading |

### Stat Cards
| Hebrew | English | Icon |
|--------|---------|------|
| סך הכל גיחוכים | Total Memes | Image |
| גיחוכים היום | Memes Today | Calendar |
| גיחוכים השבוע | Memes This Week | TrendingUp |
| ממוצע יומי | Daily Average | BarChart3 |

### Traffic Sources Section
| Hebrew | English | Context |
|--------|---------|---------|
| **מקורות תנועה** | **Traffic Sources** | Section heading |
| 🔗 קישור ישיר | 🔗 Direct Link | Origin label (when origin === 'link') |
| 📍 QR: {location} | 📍 QR: {location} | Origin label (QR code) |
| אין נתונים | No data | Empty state |

### Popular Tags Section
| Hebrew | English | Context |
|--------|---------|---------|
| **תגיות פופולריות** | **Popular Tags** | Section heading |
| אין נתונים | No data | Empty state |

### Popular Locations Section
| Hebrew | English | Context |
|--------|---------|---------|
| **מיקומים פופולריים** | **Popular Locations** | Section heading |
| אין נתונים | No data | Empty state |

---

## 13. ADMIN - MEME MANAGEMENT

| Hebrew | English | Context |
|--------|---------|---------|
| טוען גיחוכים... | Loading memes... | Loading message |
| **ניהול גיחוכים ({count})** | **Manage Memes ({count})** | Page heading |
| אין גיחוכים עדיין | No memes yet | Empty state |

### Table Headers
| Hebrew | English |
|--------|---------|
| תמונה | Image |
| סטטוס | Status |
| תגיות | Tags |
| מיקום | Location |
| תאריך יצירה | Creation Date |
| פעולות | Actions |

### Status Badges
| Hebrew | English | Icon |
|--------|---------|------|
| מוסתר | Hidden | EyeOff |
| גלוי | Visible | Eye |

### Empty States
| Hebrew | English |
|--------|---------|
| אין תגיות | No tags |
| אין מיקום | No location |
| לא ידוע | Unknown |

### Action Buttons
| Hebrew | English | Icon | Context |
|--------|---------|------|---------|
| הצג בגלריה | Show in gallery | Eye | When hidden |
| הסתר מהגלריה | Hide from gallery | EyeOff | When visible |
| פתח תמונה | Open image | ExternalLink | - |
| מחק לצמיתות | Delete permanently | Trash2 | - |

### Delete Confirmation Modal
| Hebrew | English | Context |
|--------|---------|---------|
| **מחיקת גיחוך** | **Delete Meme** | Modal title |
| האם אתה בטוח שברצונך למחוק את הגיחוך? פעולה זו לא ניתנת לביטול. | Are you sure you want to delete this meme? This action cannot be undone. | Confirmation message |
| ביטול | Cancel | Button |
| מוחק... | Deleting... | Button loading |
| מחק | Delete | Button |

### Toast Messages
| Hebrew | English | Context |
|--------|---------|---------|
| שגיאה בטעינת גיחוכים | Error loading memes | Error |
| הגיחוך הוסתר מהגלריה (נשמר במסד הנתונים) | Meme hidden from gallery (saved in database) | Success (hide) |
| הגיחוך חזר להיות גלוי בגלריה | Meme is now visible in gallery | Success (show) |
| שגיאה בעדכון הסטטוס | Error updating status | Error |
| הגיחוך נמחק בהצלחה | Meme deleted successfully | Success |
| שגיאה במחיקת הגיחוך | Error deleting meme | Error |

---

## 14. ADMIN - CONTACT MESSAGES

| Hebrew | English | Context |
|--------|---------|---------|
| טוען הודעות... | Loading messages... | Loading message |

### Empty State
| Hebrew | English | Icon |
|--------|---------|------|
| **אין הודעות** | **No Messages** | Mail |
| טרם התקבלו הודעות מהמשתמשים | No messages received from users yet | - |

### Stat Cards
| Hebrew | English | Icon |
|--------|---------|------|
| סה"כ הודעות | Total Messages | Mail |
| לא נקראו | Unread | Mail (orange) |
| נקראו | Read | CheckCircle |

### Message Source Labels
| Hebrew | English | Source Value |
|--------|---------|---------------|
| דף פרטיות | Privacy Page | privacy_page |
| דף הבית | Home Page | homepage |
| פוטר | Footer | footer |

### Message Details
| Hebrew | English | Context |
|--------|---------|---------|
| אנונימי | Anonymous | Default name |
| **חדש** | **New** | Status badge (unread) |
| לא ידוע | Unknown | Date fallback |

### Action Buttons
| Hebrew | English | Icon |
|--------|---------|------|
| סמן כנקרא | Mark as read | CheckCircle |
| מחק | Delete | Trash2 |

### Confirm Dialog
| Hebrew | English | Context |
|--------|---------|---------|
| האם אתה בטוח שברצונך למחוק הודעה זו? | Are you sure you want to delete this message? | Confirm message |

### Toast Messages
| Hebrew | English | Context |
|--------|---------|---------|
| שגיאה בטעינת הודעות | Error loading messages | Error |
| ההודעה נמחקה | Message deleted | Success |
| שגיאה במחיקת ההודעה | Error deleting message | Error |
| סומן כנקרא | Marked as read | Success |
| שגיאה בעדכון ההודעה | Error updating message | Error |

---

## 15. ERROR BOUNDARY

| Hebrew | English | Context |
|--------|---------|---------|
| ⚠️ משהו השתבש | ⚠️ Something Went Wrong | Error heading |
| אירעה שגיאה בלתי צפויה. אנחנו מתנצלים על אי הנוחות. | An unexpected error occurred. We apologize for the inconvenience. | Error message |
| **פרטי שגיאה טכניים** | **Technical Error Details** | Details summary |
| טען מחדש את הדף | Reload Page | Button |
| חזור לדף הבית | Return to Home | Button |

---

## 16. UPDATE NOTIFICATION

| Hebrew | English | Context |
|--------|---------|---------|
| 🎉 גרסה חדשה זמינה! | 🎉 New Version Available! | Banner heading |
| לחץ לטעינה מחדש | Click to reload | Banner description |
| רענן עכשיו | Refresh Now | Button |

---

## 17. FEATURED CAROUSEL (Homepage)

| Hebrew | English | Context |
|--------|---------|---------|
| שגיאה בטעינת הגיחוכים המובילים | Error loading featured memes | Error message |
| אין גיחוכים להצגה כרגע | No memes to display right now | Empty state |
| צור את הגיחוך הראשון! | Create the first meme! | CTA button |
| הקודם | Previous | Button aria-label |
| הבא | Next | Button aria-label |
| עבור לגיחוך {number} | Go to meme {number} | Slide indicator |
| צפה בכל הגיחוכים | View All Memes | Link button |

---

## 18. PUBLISHING HOOK (usePublishMeme)

| Hebrew | English | Context |
|--------|---------|---------|
| מפרסם גיחוך... | Publishing meme... | Loading toast |
| הגיחוך פורסם בהצלחה! 🎉 | Meme published successfully! 🎉 | Success toast |
| {errorMessage} | {errorMessage} | Error toast (dynamic) |

---

## 19. 404 PAGE (Not Found)

| Hebrew | English | Context |
|--------|---------|---------|
| **404** | **404** | Large number |
| **הדף לא נמצא** | **Page Not Found** | Heading |
| הדף שחיפשתם אינו קיים או הועבר למיקום אחר | The page you're looking for doesn't exist or has been moved | Message |
| חזרה לדף הבית | Back to Home | Button |

---

## 20. PRIVACY POLICY CONTENT

**Note:** This section contains the full privacy policy from `privacyContent.json`. Due to length, I'll provide the structure and key sections. The full translation should maintain legal accuracy.

### Main Title & Metadata
| Hebrew | English |
|--------|---------|
| מדיניות פרטיות ותנאי שימוש | Privacy Policy and Terms of Service |
| ינואר 2026 | January 2026 |

### TL;DR Section
| Hebrew | English |
|--------|---------|
| כמה מילים לפני שמתחילים | A Few Words Before We Start |

**Subsection 1: Nice to Meet You**
- Hebrew: נעים להכיר - אני עידו, סטודנט לאדריכלות בשנה ה׳...
- English: Nice to meet you - I'm Ido, a 5th-year architecture student...

**Subsection 2: Everything is Public**
- Hebrew: הכל כאן פומבי, וזה כל הרעיון...
- English: Everything here is public, and that's the whole point...

**Subsection 3: Location Privacy Warning**
- Hebrew: מיקום הוא חלק מהסיפור – השתמשו בו בתבונה...
- English: Location is part of the story – use it wisely...

**Subsection 4: Give a Smile**
- Hebrew: תנו חיוך...
- English: Give a smile...

**Subsection 5: Contact**
- Hebrew: צרו קשר...
- English: Contact us...

### Legal Sections (1-9)
Each section requires careful legal translation. Key sections include:

1. **Introduction and Academic Background**
2. **Research Purpose**
3. **Data Collection Types** (with privacy warnings)
4. **Data Usage and Retention**
5. **Third-Party Services** (Firebase, OpenStreetMap, etc.)
6. **Copyright and Intellectual Property**
7. **User Rights**
8. **Minimum Age** (16+)
9. **Contact Information**

### Final Consent Statement
- Hebrew: בעצם השימוש בפלטפורמה...
- English: By using the platform...

---

## TRANSLATION COMPLETION CHECKLIST

### Phase 1: Core Translation ⬜
- [ ] All 680+ strings translated
- [ ] Legal sections professionally translated
- [ ] Tone and voice consistency verified
- [ ] Variable placeholders preserved
- [ ] RTL/LTR considerations noted

### Phase 2: Implementation ⬜
- [ ] Create `src/locales/he.json`
- [ ] Create `src/locales/en.json`
- [ ] Create `src/data/privacyContent_en.json`
- [ ] Install i18n library (react-i18next)
- [ ] Create language context/provider
- [ ] Add language toggle component

### Phase 3: Component Updates ⬜
- [ ] Replace all hardcoded strings with `t()` function
- [ ] Update all page components
- [ ] Update all common components
- [ ] Update all editor components
- [ ] Update all gallery components
- [ ] Update all admin components
- [ ] Update all layout components

### Phase 4: Testing ⬜
- [ ] Test all pages in Hebrew
- [ ] Test all pages in English
- [ ] Test language switching
- [ ] Test RTL/LTR layouts
- [ ] Test localStorage persistence
- [ ] Verify all dynamic variables work
- [ ] Check admin panel translations

### Phase 5: Documentation ⬜
- [ ] Update README with i18n info
- [ ] Document translation process
- [ ] Create contribution guide for translators
- [ ] Update PROJECT_STATUS.md

---

## NOTES FOR TRANSLATORS

1. **"גיחוך" (Gichuch)** is a portmanteau of Hebrew words meaning "laugh" and "architecture". For English, we suggest:
   - Formal contexts: "Meme" or "Architectural Meme"
   - Brand/Title: "Gigglechitecture" (preserves wordplay)
   - Casual contexts: "Laugh", "ArchMeme"

2. **Cultural Nuances:**
   - Hebrew version is more informal and playful
   - English should maintain academic credibility while being accessible
   - Humor should translate naturally, not literally

3. **Academic Terminology:**
   - Keep architectural terms professional
   - Research/thesis language should be formal
   - User-facing interface can be casual

4. **RTL Considerations:**
   - Hebrew remains right-to-left
   - English will be left-to-right
   - Layout components may need direction-aware styling
   - Icons (arrows, chevrons) may need to flip

5. **Dynamic Content:**
   - All `{variable}` and `${variable}` placeholders must be preserved exactly
   - Date formatting may differ (English: Jan 4, 2026 / Hebrew: 4 בינואר 2026)
   - Numbers and counters use same format

---

**Total Estimated Translation Workload:**
- ~680 unique strings
- ~15,000 words (including privacy policy)
- Estimated time: 20-30 hours for professional translation
- Additional 40-60 hours for implementation

**Recommended Next Steps:**
1. Review and approve translation strategy
2. Translate all content in bulk
3. Set up i18n infrastructure
4. Implement translations progressively (page by page)
5. Test and refine
