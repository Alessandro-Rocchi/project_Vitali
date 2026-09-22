# Implementation Plan - Codebase Audit: Eliminazione Blocchi Duplicati e Commenti Non Significativi

Revisione e pulizia dell'intera codebase del progetto per rimuovere blocchi di codice duplicati, stili sovrascritti o non operativi, import errati/ridondanti e commenti banali o privi di valore semantico (boilerplate, note personali o codice commentato).

## User Review Required

> [!IMPORTANT]
> - **Integrità visiva e funzionale**: La rimozione dei blocchi duplicati e dei commenti non altererà in alcun modo il layout, il comportamento responsive o le funzionalità delle pagine e dei 6 temi CSS.
> - **Preservazione dei commenti significativi**: Vengono mantenuti i commenti JSDoc strutturati nelle funzioni JavaScript principali e le annotazioni descrittive sulle palette di colori dei temi complessi (es. Solarpunk, Mechanicum), mentre vengono eliminati solo i commenti di disturbo/boilerplate (es. `<!-- Link bootstrap -->`, `/*HERO IMAGE*/`, `/*per rimpicciolire l'immagine...*/`).

---

## Panoramica dei Blocchi Duplicati e Commenti Identificati

### 1. File HTML (`about.html`, `about_nouvelle_vague.html`, `index.html`, `tour.html`, `catalogue.html`, `documentation.html`, `map.html`, `about_our_team.html`)
- **Favicon duplicate/invalide**: In `about.html`, `about_nouvelle_vague.html`, `index.html` e `tour.html`, è presente `<link rel="icon" type="image/x-icon" href="images/S.png">` (percorso non esistente, la cartella del progetto è `img/`) duplicato prima di `<link rel="icon" type="image/x-icon" href="img/S.svg">`.
- **Commenti non semantici**:
  - `<!-- Per i google fonts -->`
  - `<!-- Per le bootstrap icons -->`
  - `<!-- Link bootstrap -->`
  - `<!-- Script bootstrap -->`
  - `<!-- nostro css -->`
  - `<!-- navbar -->`
  - `<!-- contenuto della pagina -->`
  - `<!-- BREADCRUMBS -->`
  - `<!-- FOOTER -->`
  - `<!-- Due card centrali -->`
  - `<!-- le card di ispirazione -->`
  - `<!-- prima immagine cliccabile... -->`
  - `<!-- prova modifica di indice e contenuto pagina -->`
  - `<!-- PILLS -->`, `<!-- Back to first button -->`, `<!-- MAP and PARAGRAPHS -->`, `<!-- Per il leaflet -->`

### 2. File CSS (`styles/*.css`)
- **`eighties_theme.css`**:
  - **Blocco duplicato massivo (~118 righe, ll. 1155–1273)**: Blocco residuo incollato per errore da `nouvelle_vague_theme.css` con colori rossi `#A92325`, percorsi errati (`url('img/saint_sulpiere.png')`) e stili di bottoni/tour interamente sovrascritti subito dopo alla riga 1274 con gli effettivi stili fluorescenti anni '80 (`#33FF33`, font VT323).
  - **Doppia animazione rotazione freccia**: `.btn-desktop-toggle.is-open #arrow_forward_ios` dichiarato identicamente due volte (ll. 634-636 e 648-650).
  - **Doppia transizione freccia**: `.btn-desktop-toggle #arrow_forward_ios` dichiarato due volte (ll. 630-632 e 638-641).
  - **Duplicati `aside.bookmarks`**: `aside.bookmarks { align-self: flex-start; height: auto; }` dichiarato due volte consecutivamente (ll. 853-856 e 858-862); regola `@media (min-width: 991px)` ridondante a riga 846-851 resa obsoleta da 885-891.
  - **Media query ridondante per `.hero-img`**: `@media (max-width: 992px) { .hero-img { display: none; } }` quando `.hero-img { display: none; }` è già globale.
- **`nouvelle_vague_theme.css`**:
  - **Duplicazione regola tipografica**: `h1, h2, h3` definito identico alle righe 1-5 e riga 1034-1038 (sotto il commento fuorviante `/*set a background color to the body*/`).
  - **Regole morte/sovrascritte `#btn-film`**: Le righe 269-281 impostano testo blu/underline su `#btn-film`, ma sono completamente annullate dalle righe 301-315 che definiscono il vero stile a bottone (`background-color: #d32f2f`, `color: #F4F1EA`, `border-radius: 4px`).
- **`rococo_theme.css`**:
  - **Regole morte/sovrascritte `#btn-film`**: Righe 1283-1293 (colore del link) completamente sovrascritte da 1326-1338 (bottone oro/verde pastello).
- **`mechanicum_theme.css`**:
  - **Blocco duplicato consecutivo identico**: `.catchphrase h1, .catchphrase h1 span, header > .row h1` dichiarato due volte di fila alle righe 162-167 e 169-174.
- **`futurism_theme.css`**:
  - **Regola duplicata `.material-symbols-outlined`**: Dichiarata identica alla riga 1235 e riga 1467.
- **`solarpunk_theme.css`**:
  - **Regola sdoppiata `aside.bookmarks`**: Sdoppiata inutilmente tra 828-831 e 837-850, unificabile in una singola dichiarazione coesa.
- **Commenti non semantici e codice commentato nei CSS**:
  - Commenti rumorosi come `/*HERO IMAGE*/`, `/*FINE HERO IMAGE*/`, `/*SCROLLBAR*/`, `/*PAGINA TOUR*/`, `/*GOOGLE FONTS & ICONS*/`.
  - Codice disattivato: `/*background-attachment: fixed;*/`, `/*background-color:rgba(255, 0, 60, 0.32);*/`, `/*outline: 1px solid #A87C43; outline-offset: -7px;*/`.
  - Note informali di sviluppo (es. `/*per avere il viewport responsive...*/`, `/*tento di modificare le immagini...*/`, `/*per lo zoom delle card*/`).

---

## Proposed Changes

### File HTML

#### [MODIFY] [about.html](file:///d:/InfoUma/project_Vitali/about.html)
- Rimuovere il tag duplicato/invalido `<link rel="icon" type="image/x-icon" href="images/S.png">`.
- Rimuovere commenti non semantici (`<!-- Per i google fonts -->`, `<!-- navbar -->`, ecc.).

#### [MODIFY] [about_nouvelle_vague.html](file:///d:/InfoUma/project_Vitali/about_nouvelle_vague.html)
- Rimuovere favicon duplicata.
- Rimuovere commenti rumorosi e bozze (`<!-- prova modifica di indice... -->`).

#### [MODIFY] [about_our_team.html](file:///d:/InfoUma/project_Vitali/about_our_team.html)
- Pulire i commenti boilerplate di intestazione e struttura.

#### [MODIFY] [catalogue.html](file:///d:/InfoUma/project_Vitali/catalogue.html)
- Rimuovere commenti inutili (es. `<!-- --dopo questo -->`, `<!-- pagination -->`), preservando le note esplicative dell'offcanvas.

#### [MODIFY] [documentation.html](file:///d:/InfoUma/project_Vitali/documentation.html)
- Rimuovere commenti non informativi nell'head, preservando la struttura delle sezioni documentali.

#### [MODIFY] [index.html](file:///d:/InfoUma/project_Vitali/index.html)
- Rimuovere favicon duplicata `images/S.png`.
- Rimuovere commenti descrittivi ovvii (`<!-- Due card centrali -->`, `<!-- le card di ispirazione -->`, ecc.).

#### [MODIFY] [map.html](file:///d:/InfoUma/project_Vitali/map.html)
- Rimuovere commenti non informativi nell'head.

#### [MODIFY] [tour.html](file:///d:/InfoUma/project_Vitali/tour.html)
- Rimuovere favicon duplicata `images/S.png`.
- Rimuovere commenti rumorosi (`<!-- PILLS -->`, `<!-- MAP and PARAGRAPHS -->`, ecc.).

---

### File JavaScript

#### [MODIFY] [scripts.js](file:///d:/InfoUma/project_Vitali/script/scripts.js)
- Mantenere la documentazione JSDoc delle funzioni, rimuovere eventuali commenti ridondanti inline o di debug.

#### [MODIFY] [map_scripts.js](file:///d:/InfoUma/project_Vitali/script/map_scripts.js)
- Rimuovere la funzione duplicata `loadJson()`, facendo affidamento su quella condivisa già inclusa da `scripts.js` (o dichiarandola in modo condizionale/riusabile per non duplicarla nel runtime).
- Dichiarare la variabile locale `targetLayer` in `focusLocation` per evitare leakage globale.

---

### File CSS dei Temi

#### [MODIFY] [eighties_theme.css](file:///d:/InfoUma/project_Vitali/styles/eighties_theme.css)
- Rimuovere il blocco duplicato di 118 righe (ll. 1155–1273).
- Eliminare le regole duplicate di `.btn-desktop-toggle #arrow_forward_ios`, `aside.bookmarks` e la media query superflua `.hero-img`.
- Eliminare i commenti non semantici (`/*HERO IMAGE*/`, `/*FINE HERO IMAGE*/`, ecc.).

#### [MODIFY] [nouvelle_vague_theme.css](file:///d:/InfoUma/project_Vitali/styles/nouvelle_vague_theme.css)
- Rimuovere il blocco duplicato `h1, h2, h3` a riga 1034-1038 e il commento errato associato.
- Rimuovere le regole morte/sovrascritte `#btn-film` a riga 269-281.
- Rimuovere commenti rumorosi e codice CSS disattivato.

#### [MODIFY] [futurism_theme.css](file:///d:/InfoUma/project_Vitali/styles/futurism_theme.css)
- Rimuovere la duplicazione di `.material-symbols-outlined`.
- Rimuovere commenti non semantici e proprietà commentate.

#### [MODIFY] [mechanicum_theme.css](file:///d:/InfoUma/project_Vitali/styles/mechanicum_theme.css)
- Rimuovere la duplicazione consecutiva di `.catchphrase h1, .catchphrase h1 span, header > .row h1`.
- Pulire commenti informali mantenendo la descrizione della palette.

#### [MODIFY] [rococo_theme.css](file:///d:/InfoUma/project_Vitali/styles/rococo_theme.css)
- Rimuovere le regole sovrascritte `#btn-film` alle righe 1283-1293.
- Rimuovere commenti non semantici e codice disattivato.

#### [MODIFY] [solarpunk_theme.css](file:///d:/InfoUma/project_Vitali/styles/solarpunk_theme.css)
- Unificare le dichiarazioni consecutive di `aside.bookmarks`.
- Rimuovere commenti non significativi preservando la palette.

---

## Verification Plan

### Automated Verification
- Script di test automatico via Python per verificare:
  - Assenza di regole duplicate esatte in ciascun file CSS.
  - Assenza di favicon rotte o duplicate nei file HTML.
  - Verifica della corretta definizione e accessibilità di `loadJson()` e delle funzioni JS.
  - Parsing corretto di tutti i file HTML, CSS e JS senza errori di sintassi.

### Manual / Browser Verification
- Avviare un server locale (`python -m http.server 8000`) e verificare:
  - Funzionamento completo della mappa (`map.html`), ricerca pin, filtri regista/anno, routing e popup.
  - Funzionamento del tour (`tour.html`) con animazioni Leaflet e navigazione stop.
  - Funzionamento del catalogo (`catalogue.html`) con paginazione e toggle filtri.
  - Switch dinamico di tutti i 6 temi della palette verificando l'aspetto visivo e la persistenza.
