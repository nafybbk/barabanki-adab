# Website ka Guide — Kya kahan daalna hai

Ye website is tarah organize ki gayi hai ke sab kuch ek hi jagah se update
ho sake: `assets/js/data.js`

## 1. Ustad sahab ki tafseel

`assets/js/data.js` file kholein, upar `poet` object mein:
- `name`, `nameUrdu` — poora naam
- `takhallus`, `takhallusUrdu` — takhallus (pen-name)
- `tagline` — homepage ka mukhtasar jumla
- `bio`, `bioUrdu` — taaruf ka paragraph
- `photo` — tasveer ka path (neeche point 4 dekhein)

## 2. Bazm-e-Aziz ki tafseel

Wahi file mein `bazm` object mein naam, intro aur qayam ka saal likhein.

## 3. Kitabein (PDFs)

- Apni 5 PDF files `assets/pdf/` folder mein daalein
  (jaise `book1.pdf`, `book2.pdf` waghera)
- `data.js` mein `books` array ke har item mein:
  - `title`, `titleUrdu` — kitab ka naam
  - `pdf` — file ka path, jaise `"assets/pdf/book1.pdf"`
  - `cover` — cover image ka path (point 4 dekhein)
  - `description` — mukhtasar taaruf

PDF upload hote hi flipbook reader (`books/reader.html`) automatically
usse page-by-page dikhana shuru kar dega — koi extra kaam nahi.

## 4. Tasveerein

`assets/img/` folder mein ye tasveerein daalein:
- `poet-portrait.jpg` — Ustad sahab ki tasveer
- `book1-cover.jpg` se `book5-cover.jpg` — har kitab ka cover

Agar tasveer nahi hai to website khud hi ek khoobsurat placeholder
dikha degi (kuch tootega nahi).

## 5. Shayeri Archive (searchable)

`data.js` mein `poems` array hai. Har PDF se sher/ghazal nikal kar
is tarah add karte jayein:

```js
{
  id: "p2",
  book: "Pehli Kitab",       // kaunsi kitab se hai
  title: "Ghazal ka naam",
  text: "Roman/Hindi transliteration...",
  textUrdu: "اردو متن یہاں",
  tags: ["ishq", "wisal"],   // talaash ke liye keywords
}
```

Agar PDF **typed text** hai to text copy-paste karna aasan hoga.
Agar PDF **scanned image** hai to text manually type karna padega
(ya kisi OCR tool — jaise Google Lens — se nikaal kar paste karein).

## 6. Barabanki ki tafseel

`data.js` ke neeche in sections mein apni maloomat bharein:
- `city` — intro aur tareekh
- `poets` — Khumar Barabankvi aur doosre shayer
- `dargah` — Dewa Sharif, Satrikh, Masauli waghera
- `emergency` — police, ambulance, fire numbers
- `hospitals`, `schools`, `parks`, `places`, `showrooms`,
  `cuisine`, `hotels`, `jobs` — apni list se replace karein

## 7. Shagird Circle (login/posting)

Ye already kaam kar raha hai — koi setup nahi chahiye. Filhal ye
browser ki local storage mein data rakhta hai (yani sirf usi
computer/browser par dikhega jahan se post hui ho).

**Agar aap chahte hain ke sab shagirdon ki posts sab logon ko dikhein
(real website ki tarah)**, to iske liye ek chhota backend/database
chahiye hoga — jab PDFs aa jayein, tab hum is par baat kar sakte hain.

## Website dekhna (local preview)

Kisi bhi file ko double-click karke browser mein khol sakte hain,
ya `index.html` par right-click karke "Open with browser".

## Deploy karna (internet par dalna)

Jab content bhar jaye, ye poora folder Vercel, Netlify, ya GitHub Pages
par free mein host ho sakta hai — bata dein jab time ho, main madad
kar dunga.
