# Les Rues du CSS (Cinéma Sur la Seine)

[![Deploy static content to Pages](https://github.com/Alessandro-Rocchi/vitali_project_DHDK/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/Alessandro-Rocchi/vitali_project_DHDK/actions/workflows/deploy-pages.yml)
[![W3C HTML5](https://img.shields.io/badge/HTML5-Semantic-orange.svg)](https://w3.org)
[![CSS3 6 Themes](https://img.shields.io/badge/CSS3-6_Custom_Themes-blue.svg)](styles/)
[![Leaflet.js](https://img.shields.io/badge/Leaflet.js-1.9.4-green.svg)](https://leafletjs.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple.svg)](https://getbootstrap.com/)

> **Walk Paris through the lens of the Nouvelle Vague**  
> Examination project for the *Web Technologies* course – Prof. Fabio Vitali  
> **Master's Degree in Digital Humanities and Digital Knowledge (DHDK)**  
> University of Bologna

project website: [https://alessandro-rocchi.github.io/project_Web_Technologies/](https://alessandro-rocchi.github.io/project_Web_Technologies/)

---

## 📖 Project Overview

**Les Rues du CSS (Cinéma Sur la Seine)** is an interactive, multidisciplinary web application designed to explore the cinematic geography of the **French New Wave (Nouvelle Vague)** in Paris between the late 1950s and 1960s.

Through georeferenced cartography, an analytical catalogue, 6 thematic guided tours, and a historical monograph with an interactive timeline, the platform reconnects the physical topography of the French capital with its cinematic transfiguration on the silver screen.

### 🎭 The Wordplay "Les Rues du CSS"
The project title carries a deliberate double meaning:
- **Cinematic Acronym**: *Cinéma Sur la Seine* (cinema along the Seine and across the streets of Paris).
- **Technological Acronym**: *Cascading Style Sheets* (the styling foundation of modern web design).

The site features **6 custom, fully distinct CSS stylesheets switchable at runtime** (Solarpunk, Nouvelle Vague B&W, Eighties Synthwave, Futurism, Mechanicum, and Rococo) with persistence in `localStorage`, demonstrating complete decoupling between semantic HTML structure and visual presentation.

---

## 🚀 Key Features

- 🗺️ **Interactive Map (`map.html`)**:
  - Leaflet cartography with 26 historical film locations across Paris.
  - Autocomplete search via `Leaflet.PinSearch`.
  - Multi-criteria dynamic filtering by **Director** and **Decade** (1950–1959, 1960–1969).
  - Cinematic itinerary calculation and path drawing using `Leaflet Routing Machine`.
  - Information panel with **3-Tier Progressive Disclosure** (Short $\rightarrow$ Medium $\rightarrow$ Detailed) and individual movie cards with vintage film posters.
  - Deep linking via URL query parameters (`?location=...`).

- 🚶 **Guided Thematic Tours (`tour.html`)**:
  - 6 curated itineraries (Godard, Agnès Varda, Top 10, Cinematic Churches, Hidden Gems, Montmartre District).
  - Step-by-step navigation synchronized with automatic camera flight (`flyTo`).
  - Real-time progress bar and metadata badges (estimated duration, accessibility, time of day).

- 📚 **Location Catalogue (`catalogue.html`)**:
  - Responsive card grid populated asynchronously from metadata.
  - Smart sliding-window pagination with ellipsis compression (`getPaginationRange`).
  - Collapsible desktop filter sidebar and mobile offcanvas drawer.

- 📜 **Historical Monograph and Timeline (`about_nouvelle_vague.html`)**:
  - In-depth theoretical essay covering Cahiers du Cinéma, *politique des auteurs*, *caméra-stylo*, Left Bank vs. Right Bank, and May 1968.
  - Integrated interactive timeline via **KnightLab TimelineJS**.
  - Fixed sidebar bookmarks and documentary iconography.

- 🎨 **Global Theme Switcher**:
  - Floating palette widget accessible across all pages.
  - 6 themes: Solarpunk, Nouvelle Vague, Eighties, Futurism, Mechanicum, Rococo.

---

## 🗂️ Repository Structure

```
project_Web_Technologies/
├── .github/workflows/deploy-pages.yml   # GitHub Pages CI/CD pipeline
├── data/
│   ├── paris.geojson                  # 26 georeferenced WGS84 coordinates & tags
│   ├── paris_metadata.json            # Historical metadata, 3-tier texts, and film data
│   └── tour_data.json                 # Curated narrative data for 6 thematic tours
├── img/
│   ├── img_movie/                     # Historical (Old) vs. contemporary (Modern) photo pairs
│   └── ...                            # Logos, director portraits, and graphic assets
├── script/
│   ├── map_scripts.js                 # Cartography engine (search, filters, routing, panel)
│   └── scripts.js                     # Multi-page router, tour engine, catalogue, themes
├── styles/
│   ├── eighties_theme.css             # 1980s Synthwave / Neon Theme
│   ├── futurism_theme.css             # Avant-garde Futurism Theme
│   ├── mechanicum_theme.css           # Dark Industrial / Grimdark Theme
│   ├── nouvelle_vague_theme.css       # Monochromatic Classic B&W Theme
│   ├── rococo_theme.css               # Neoclassical Pastel Theme
│   └── solarpunk_theme.css            # Organic Eco-Futuristic Theme (Default)
├── about.html                         # Exploration hub
├── about_nouvelle_vague.html          # Historical monograph + KnightLab TimelineJS
├── about_our_team.html                # Team presentation page
├── catalogue.html                     # Paginated location catalogue
├── documentation.html                 # Dedicated technical documentation web page
├── index.html                         # Homepage
├── map.html                           # Full interactive map
├── tour.html                          # Guided tour experience
├── DOCUMENTATION.md                   # Comprehensive architectural documentation (Markdown)
└── README.md                          # Repository overview (this file)
```

---

## 💻 Local Setup and Development

Because the application fetches external `.json` and `.geojson` data asynchronously via `fetch()`, browser security policies (CORS) restrict execution when opened directly using `file:///`. It must be served via a local HTTP server.

### Using Python 3 (Recommended)
```bash
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

### Using Node.js / npx
```bash
npx serve .
```

### Using Visual Studio Code
Use the **Live Server** extension by right-clicking `index.html` and selecting **"Open with Live Server"**.

---

## 👥 Development Team

- **Alessandro Rocchi** (*Presidente*) - [GitHub](https://github.com/Alessandro-Rocchi)
- **Daniele Bottaro** (*Dan*) - [GitHub](https://github.com/DanieleBottaro)
- **Elena Mocci** (*Mele*) - [Github](https://github.com/elemocc)

*Created for the University of Bologna – Master's Degree in Digital Humanities and Digital Knowledge (DHDK).*

---

## 📑 Full Documentation

For comprehensive technical specifications, data schemas, JavaScript API references, and design system rationales, explore the full documentation:

- 🌐 **[Interactive Web Documentation](https://alessandro-rocchi.github.io/project_Vitali/documentation.html)** (live web page styled with all 6 themes)
- 📄 **[DOCUMENTATION.md](DOCUMENTATION.md)** (complete repository markdown file)
