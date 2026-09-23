# Les Rues du CSS (Cinéma Sur la Seine)
## Technical and Architectural Project Documentation

> **Academic Project in Digital Humanities & Web Technologies**  
> **Master's Degree in Digital Humanities and Digital Knowledge (DHDK) – University of Bologna**  
> **Course Instructor:** Prof. Fabio Vitali  
> **Development Team:**  
> - **Alessandro Rocchi** (*Presidente*)  
> - **Daniele Bottaro** (*Dan*)  
> - **Elena Mocci** (*Mele*)  
> **GitHub Repositories:** [Alessandro-Rocchi/vitali_project_DHDK](https://github.com/Alessandro-Rocchi/vitali_project_DHDK) / [Alessandro-Rocchi/project_Web_Technologies](https://github.com/Alessandro-Rocchi/project_Web_Technologies)

---

## Table of Contents

1. [Introduction and Project Vision](#1-introduction-and-project-vision)
2. [Conceptual Architecture and Repository Structure](#2-conceptual-architecture-and-repository-structure)
3. [In-Depth Web Page Analysis](#3-in-depth-web-page-analysis)
   - [3.1 Home Page (`index.html`)](#31-home-page-indexhtml)
   - [3.2 Interactive Cinema Map (`map.html`)](#32-interactive-cinema-map-maphtml)
   - [3.3 Location Catalogue (`catalogue.html`)](#33-location-catalogue-cataloguehtml)
   - [3.4 Thematic Tour Engine (`tour.html`)](#34-thematic-tour-engine-tourhtml)
   - [3.5 Exploration Hub (`about.html`)](#35-exploration-hub-abouthtml)
   - [3.6 Critical Monograph and Timeline (`about_nouvelle_vague.html`)](#36-critical-monograph-and-timeline-about_nouvelle_vaguehtml)
   - [3.7 Team Presentation (`about_our_team.html`)](#37-team-presentation-about_our_teamhtml)
4. [Data Modeling and Schemas](#4-data-modeling-and-schemas)
   - [4.1 Spatial Features and Coordinates (`data/paris.geojson`)](#41-spatial-features-and-coordinates-dataparisgeojson)
   - [4.2 Extended Historical Metadata (`data/paris_metadata.json`)](#42-extended-historical-metadata-dataparis_metadatajson)
   - [4.3 Curated Narrative Itineraries (`data/tour_data.json`)](#43-curated-narrative-itineraries-datatour_datajson)
5. [Client-Side Application Logic](#5-client-side-application-logic)
   - [5.1 Multi-Page Controller & Tour Engine (`script/scripts.js`)](#51-multi-page-controller--tour-engine-scriptscriptsjs)
   - [5.2 Advanced Cartography Engine (`script/map_scripts.js`)](#52-advanced-cartography-engine-scriptmap_scriptsjs)
6. [Design System and Dynamic CSS Theming](#6-design-system-and-dynamic-css-theming)
   - [6.1 The Wordplay "Les Rues du CSS"](#61-the-wordplay-les-rues-du-css)
   - [6.2 Detailed Review of the 6 Custom Themes](#62-detailed-review-of-the-6-custom-themes)
   - [6.3 Typography, Iconography, and UI Framework](#63-typography-iconography-and-ui-framework)
7. [Multimedia Integration and Visual Assets](#7-multimedia-integration-and-visual-assets)
8. [Deployment Pipeline and CI/CD](#8-deployment-pipeline-and-cicd)
9. [Local Development and Setup Guide](#9-local-development-and-setup-guide)

---

## 1. Introduction and Project Vision

**Les Rues du CSS (Cinéma Sur la Seine)** is an interactive, multidisciplinary web platform dedicated to cinematic cartography and the cultural exploration of the French **Nouvelle Vague** (New Wave) in Paris between the late 1950s and late 1960s.

Conceived as part of the *Web Technologies* curriculum within the *Digital Humanities and Digital Knowledge* (DHDK) Master's Degree at the University of Bologna (taught by Prof. Fabio Vitali), the project addresses four interconnected challenges:

1. **Historical & Cinematic Research**: Identifying real Parisian urban locations transformed into open-air film sets by foundational auteurs of the movement (Jean-Luc Godard, François Truffaut, Agnès Varda, Jacques Rivette, Chris Marker).
2. **Geospatial & Semantic Data Modeling**: Structuring Points of Interest (POIs) using open, standard formats (`GeoJSON` and `JSON`), enriched with relational film metadata, multi-tier descriptions (*Progressive Disclosure*), and vintage vs. modern comparison photography.
3. **Interactive Spatiotemporal Exploration**: Dynamic cartography powered by Leaflet.js, itinerary path calculation via Leaflet Routing Machine, and step-by-step narrative tour storytelling with synchronized camera animations.
4. **Demonstrating the Full Power of CSS**: Providing **6 completely distinct visual themes** switchable at runtime without altering a single character of HTML markup, with user preferences persisted in `localStorage`. This serves as an academic and practical demonstration of total decoupling between semantic markup and visual presentation.

---

## 2. Conceptual Architecture and Repository Structure

The project is built as a zero-build, modular client-side static web application adhering to W3C standards, ensuring portability, zero runtime server overhead, and automatic deployment via GitHub Pages.

### Repository Directory Tree

```
project_Web_Technologies/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml          # GitHub Actions CI/CD pipeline for GitHub Pages
├── data/
│   ├── paris.geojson                 # GeoJSON FeatureCollection (26 Paris film locations)
│   ├── paris_metadata.json           # Extended metadata, 3-tier texts, and linked filmography
│   └── tour_data.json                # Narrative data for 6 curated thematic tours
├── img/
│   ├── img_movie/                    # Historical (Old) vs. contemporary (Modern) photo pairs
│   │   ├── arcDeTriompheModern.jpg
│   │   ├── arcDeTriompheOld.jpg
│   │   ├── cafeDuDomeModern.png
│   │   ├── cafeDuDomeOld.png
│   │   ├── louvreModern.png
│   │   ├── louvreOld.jpeg
│   │   └── ...                       # (46 total comparison assets across 26 locations)
│   ├── agnes_varda.jpg               # Director portraits and historical photography
│   ├── andre-bazin.jpg
│   ├── breathless.jpg
│   ├── breathless-hero.jpg
│   ├── cow_pres.jpg, cow_dani.jpg... # Playful team member avatars
│   ├── generic_bg.png                # Fallback visual asset for missing images
│   ├── hidden-gems.jpg
│   ├── Jean-Luc-Godard.jpg
│   ├── montmartre-sacre-coeur.jpg
│   ├── nouvelle_vague.jpg
│   ├── paris_nousAppartient.webp
│   ├── S.png, S.svg                  # Project branding, logos, and favicon
│   ├── top-ten-locations.jpg
│   └── Truffaut.jpg
├── script/
│   ├── map_scripts.js                # Interactive map engine (search, filters, routing, panel)
│   └── scripts.js                    # Multi-page controller, tour engine, catalogue, theme switcher
├── styles/
│   ├── eighties_theme.css            # 1980s Retro Synthwave / Vaporwave Theme
│   ├── futurism_theme.css            # Avant-garde Italian Futurism Theme
│   ├── mechanicum_theme.css          # Dark Industrial / Grimdark Steampunk Theme
│   ├── nouvelle_vague_theme.css      # Monochrome Classic Cinema B&W Theme
│   ├── rococo_theme.css              # 18th-century French Rococo Pastel Theme
│   └── solarpunk_theme.css           # Organic Eco-Futuristic Solarpunk Theme (Default)
├── about.html                        # Hub page linking to historical and team sections
├── about_nouvelle_vague.html         # Theoretical monograph + KnightLab TimelineJS
├── about_our_team.html               # Presentation page of the development team
├── catalogue.html                    # Analytical location catalogue with pagination & filters
├── index.html                        # Homepage with hero, conceptual cards, and tour links
├── map.html                          # Full-screen interactive map of Paris
├── tour.html                         # Step-by-step guided tour experience
├── DOCUMENTATION.md                  # Comprehensive architectural documentation (this file)
└── README.md                         # Repository landing guide for GitHub
```

---

## 3. In-Depth Web Page Analysis

All HTML documents in the repository follow a standardized, highly semantic architecture:
- Shared Google Fonts imports (`Anton`, `GFS Didot`, `Inter`, `Montserrat`, `Pinyon Script`, `Playfair`, `Space Mono`, `VT323`) and vector icon suites (`Bootstrap Icons`, `Material Symbols Outlined`).
- Bootstrap 5.3 CDN integration for a 12-column responsive layout.
- A dynamic `<link id="stylesheet_file">` element initialized to the default stylesheet and dynamically updated by the theme switcher.
- Floating `.theme` widget allowing users to select any of the 6 available themes, automatically persisted in browser `localStorage`.
- Semantic `<nav>` with brand link and collapse toggle on small viewports.
- Hierarchical breadcrumb navigation paths.
- Consistent `<footer>` with project identity, legal/academic notices, and site links.
- Routing hook: `data-page` attribute on `<body>` enabling page-specific JavaScript initialization.

---

### 3.1 Home Page (`index.html`)
- **Body Attribute:** `data-page="index"`
- **Core Sections:**
  1. **Hero Header**: Atmospheric full-width background banner with high-impact typography (*Walk Paris through the lens of the Nouvelle Vague*).
  2. **Presentation of Concept**: Title *Les Rues du CSS (Cinéma Sur la Seine)* followed by three analytical paper cards (collapsible via Bootstrap on mobile devices):
     - *A Cinematic Cartography*: Explores the spatial intersection between real Parisian topography and big-screen reinterpretation.
     - *The Road as Set*: Discusses the rejection of conventional studio sets by Godard, Truffaut, and Varda in favor of portable handheld cameras on real streets.
     - *Exploration Tools*: Introduces the interactive map, analytical catalogue, curated itineraries, and historical timeline.
  3. **Visual Call-to-Action Cards**: Two high-contrast 16:9 zoom-effect cards directing users to the interactive map (`map.html`) and the historical essay (`about_nouvelle_vague.html`).
  4. **"Looking for some inspiration?" Section**: Six curated discovery cards linking directly to pre-filtered thematic tours via URL search queries (`tour.html?keyword=...`):
     - *Top 10 locations*
     - *Jean-Luc Godard* ("Breathless" Locations)
     - *Montmartre District*
     - *Cinematic Churches*
     - *Agnès Varda's Paris*
     - *Hidden Gems*

---

### 3.2 Interactive Cinema Map (`map.html`)
- **Body Attribute:** `data-page="map"`
- **Key Modules:** `script/map_scripts.js`, `script/scripts.js`, `Leaflet.PinSearch`, `Leaflet.Routing.Machine`.
- **Functionality:**
  1. **Map Viewport (`#map`)**: OpenStreetMap canvas centered on Paris coordinates `[48.8566, 2.3522]` with zoom level 13. Zoom controls are moved to the bottom-right corner to prevent layout collision with top-left controls.
  2. **Top-Left Control Bar**:
     - **Search Button**: Toggles the `Leaflet.PinSearch` autocomplete search bar.
     - **Filters Button**: Opens a dropdown panel with two multi-criteria filters: **Director** (alphabetically sorted unique names) and **Decade** (1950–1959, 1960–1969).
     - **Explore Button**: Opens quick-access thematic shortcut cards.
  3. **Location Details & Progressive Disclosure Panel (`#info-panel`)**:
     - Displays the monument's photo and name.
     - Implements **3-tier progressive disclosure**: *Short Description* $\rightarrow$ *Medium Description* $\rightarrow$ *Detailed Description* $\rightarrow$ *Reset to Short*, controlled via an intuitive "Learn more" / "Show less" toggle button.
     - Dynamic Film Buttons (`#button-row`): Generates a button for each movie filmed at the location. Clicking a film button opens historical scene metadata, production year, director name, and vintage poster/frame.
  4. **Deep Linking Capability**: Supports URL query parameters (`map.html?location=...`). On arrival, the map automatically centers on the location with smooth flight animation (`flyTo`), opens its popup, and populates the details panel.

---

### 3.3 Location Catalogue (`catalogue.html`)
- **Body Attribute:** `data-page="catalogue"`
- **Controller:** `pages.catalogue` in `script/scripts.js`.
- **Features:**
  1. **Responsive Filter Sidebar (`#filters_menu`)**:
     - Desktop: Collapsible sidebar toggled via a dedicated button (`#desktop_filter_toggle`) with animated SVG chevron.
     - Mobile: Offcanvas slide-out drawer (`offcanvas-md`).
     - Contains dropdown controls for sorting (A-Z, Z-A, chronological), director, and film title.
  2. **Dynamic Card Grid (`#cardSection`)**:
     - Rendered asynchronously using location data from `data/paris_metadata.json`.
     - Layout: 1 card per row on mobile, 2 on tablet, 3 on desktop, 4 on wide screens.
     - Includes image error fallback: `onerror="this.onerror=null;this.src='img/generic_bg.png';"`.
     - Links directly to the map with encoded target query (`map.html?location=...`).
  3. **Smart Sliding-Window Pagination (`#pagination`)**:
     - Items per page: 9.
     - Dynamic pagination range with ellipsis compression (`getPaginationRange`), rendering accessible numbered buttons and previous/next arrows.
     - Smooth viewport scroll-to-top on page change (`scrollIntoView`).

---

### 3.4 Thematic Tour Engine (`tour.html`)
- **Body Attribute:** `data-page="tour"`
- **Controller:** `pages.tour` in `script/scripts.js`.
- **Interactive Experience:**
  1. **Dynamic Header & Metadata Pills**: Renders tour title, introductory synopsis, and 3 metadata pills (e.g., `["1 Hour", "Accessible", "Day"]`).
  2. **Tour Switcher Dropdown**: Allows instant switching between any of the 6 tours without page reload.
  3. **Synchronized Split View**:
     - Left column: Leaflet map containing exclusively the markers for the active tour, sorted in exact narrative order.
     - Right column: Narrative stop panel displaying the specific historical text for the current location, along with an action button to open it on the full map.
  4. **Tour Progression & Navigation Controls**:
     - Real-time progress bar computing percentage: `((currentTourIndex + 1) / totalStops) * 100%`.
     - `Previous` and `Next` buttons with automated boundary disabling.
     - `Back to first` button featuring smooth fade-in CSS animation (`fade 1s ease forwards`), hidden on step 0 and displayed on subsequent steps.
     - Cinematic camera travel: every stop transition triggers `mapTour.flyTo(coordinates, 16, { animate: true, duration: 1.5 })` and opens the marker popup.

---

### 3.5 Exploration Hub (`about.html`)
- **Body Attribute:** `data-page="about"`
- Acts as a gateway page presenting two responsive navigation cards:
  1. **About Nouvelle Vague**: Leads to the critical essay and historical timeline.
  2. **About Our Team**: Leads to the team presentation page.

---

### 3.6 Critical Monograph and Timeline (`about_nouvelle_vague.html`)
- **Body Attribute:** `data-page="about_nouvelle_vague"`
- **Content & Structure:**
  1. **Embedded Interactive Timeline**: Full-width iframe integrating a **KnightLab TimelineJS** timeline documenting pivotal events from post-WWII cinephilia to the late 1960s.
  2. **Fixed Sidebar Bookmarks (`aside.bookmarks`)**: Rapid navigation menu linking directly to 10 historical and theoretical chapters:
     - 1. *The Emergence of a Cinematic Revolution*
     - 2. *The Cradle of Cinephilia: Cinémathèque and Ciné-clubs*
     - 3. *Cahiers du Cinéma and the War on "Quality"*
     - 4. *A Changing France: The Socio-Economic Backdrop*
     - 5. *Technical Liberation and Stylistic Innovation*
     - 6. *1959: The Wave Breaks at Cannes*
     - 7. *Diversification and the Right vs. Left Bank*
     - 8. *Evolution and Internal Crisis of the 1960s*
     - 9. *The Swansong: May 1968 and Beyond*
     - 10. *A Global Legacy: Influencing the Influencers*
  3. **Documentary Iconography**: Curated archival photographs of François Truffaut, André Bazin, and Jean-Luc Godard filming in Paris streets, marked up with semantic `<figure>` and `<figcaption>` elements.

---

### 3.7 Team Presentation (`about_our_team.html`)
- **Body Attribute:** `data-page="about_our_team"`
- Presents the three students behind the project:
  - **Alessandro Rocchi** (*Presidente*)
  - **Daniele Bottaro** (*Dan*)
  - **Elena Mocci** (*Mele*)
- Structured using responsive Bootstrap cards with custom avatars.

---

## 4. Data Modeling and Schemas

The application is powered by three relational, flat-file JSON databases stored in `data/`.

```
                  ┌──────────────────────┐
                  │   data/paris.geojson │  (Point geometries, WGS84 coordinates,
                  └──────────┬───────────┘   bbox, keywords for tour filtering)
                             │
                             │ location name / matchTourLocation()
                             ▼
               ┌─────────────────────────────┐
               │  data/paris_metadata.json   │  (Extended historical descriptions,
               └─────────────┬───────────────┘   short/med/long tiers, linked movies)
                             │
                             │ keywords / location_name
                             ▼
                  ┌──────────────────────┐
                  │ data/tour_data.json  │  (Itineraries, sequential stops,
                  └──────────────────────┘   custom narratives, metadata pills)
```

---

### 4.1 Spatial Features and Coordinates (`data/paris.geojson`)
- **Format:** GeoJSON RFC 7946 standard (`FeatureCollection`).
- **Records:** 26 georeferenced Paris locations.
- **Sample Feature:**

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [2.3433, 48.8483]
  },
  "properties": {
    "name": "Chapelle de la Sorbonne",
    "label": "Sorbonne Chapel, Paris, France",
    "keywords": [
      "Cinematic Churches"
    ],
    "movies": [
      "Paris nous appartient"
    ],
    "poster_url": "img/img_movie/chapelleDeLaSorbonneModern.png"
  },
  "bbox": [2.3433, 48.8483, 2.3433, 48.8483]
}
```

- **Key Fields:**
  - `coordinates`: WGS84 `[longitude, latitude]` format.
  - `keywords`: Array of thematic tags matching one or more tour categories.
  - `movies`: Titles of associated films shown in quick popup summaries.
  - `poster_url`: Path to modern/preview photograph.

---

### 4.2 Extended Historical Metadata (`data/paris_metadata.json`)
- **Records:** 26 comprehensive location records.
- **3-Tier Progressive Disclosure Model:**
  - `simple_description`: Single-sentence summary.
  - `medium_description`: Contextual architectural and historical overview (2–3 sentences).
  - `detailed_description`: Full monograph detailing architectural history, cultural significance, and filming anecdotes.
- **Relational Film Array (`associated_movie`):** Supports 1-to-many relationships where multiple films share the same physical location.

```json
{
  "name": "Chapelle de la Sorbonne",
  "year": "1642",
  "associated_movie": [
    {
      "film_id": 1,
      "film_name": "Paris nous appartient",
      "director": "Jacques Rivette",
      "production_year": 1961,
      "film_scene_description": "Anne visits the Sorbonne chapel while investigating the mysterious circumstances surrounding Juan's death.",
      "film_poster_url": "img/img_movie/chapelleDeLaSorbonneOld.jpg"
    }
  ],
  "simple_description": "The private chapel of the Sorbonne University in Paris.",
  "medium_description": "A historic Parisian chapel completed in 1642 at the request of Cardinal Richelieu...",
  "detailed_description": "The Chapelle de la Sorbonne is a masterpiece of French Baroque architecture...",
  "image_url": "img/img_movie/chapelleDeLaSorbonneModern.png"
}
```

#### Extended Filmographic Metadata & Linked Open Data (LOD)
To provide exhaustive filmographic context and connect the platform with global semantic knowledge graphs, each film entry in the `associated_movie` array has been enriched with full technical credits and Linked Open Data (LOD) persistent identifiers:

- `movie_wikidata`: Direct URI linking to the corresponding Wikidata entity (e.g., `https://www.wikidata.org/wiki/Q25513` for *Paris nous appartient*). This anchors the local dataset in the Semantic Web cloud, enabling federated cross-querying and interoperability with open knowledge bases (Wikidata, DBpedia).
- `director_viaf`: Linked Open Data authority URI pointing to the Virtual International Authority File (VIAF) record for the director (e.g., `http://viaf.org/viaf/84270544` for Jacques Rivette). This provides standardized authority control, disambiguating creators across international library and cultural heritage databases.
- `starring`: Comma-separated list of principal cast members (e.g., `"Betty Schneider, Giani Esposito, Françoise Prévost"`).
- `duration`: Official film running time (e.g., `"140min"`).
- `genre`: Cinematic classification (e.g., `"drama"`).
- `production`: Film production companies and studios (e.g., `"Ajym Films, Les Films du Carrosse"`).
- `cinematographer`: Director of photography (*chef opérateur*) responsible for the camera work and lighting (e.g., `"Charles L. Bitsch"`).

#### Multi-Audience Adaptive Tone System (`tones`)
In addition to the baseline historical descriptions, `data/paris_metadata.json` incorporates a structured `tones` object introducing target-audience narrative adaptation. This architectural enhancement allows the interface to dynamically serve tailored text registers across three audience profiles, each fully implementing the complete 3-Tier Progressive Disclosure model (`simple_description`, `medium_description`, `detailed_description`):

1. **`adult` (General Public)**:
   - Balanced, culturally nuanced narrative for general visitors, cinephiles, and cultural tourists.
   - Synthesizes historical context, architectural highlights, and cinematic significance.
2. **`child` (Young Learners & Educational Storytelling)**:
   - Simplified vocabulary and engaging, imaginative storytelling designed for younger audiences and educational visits.
   - Emphasizes sensory imagery, curious historical anecdotes, and relatable visual comparisons.
3. **`professional` (Academic & Domain Specialists)**:
   - Rigorous, scholarly terminology targeting art historians, urbanists, and film scholars.
   - Details stylistic movements (e.g., French Classical Baroque, double-tiered facades), chronological benchmarks, architect attributions, and critical film-theory analysis.

#### Complete Enriched Record Structure (`data/paris_metadata.json`)

```json
{
  "location_name": "Chapelle de la Sorbonne",
  "locationYear": "1642",
  "associated_movie": [
    {
      "film_id": 1,
      "film_name": "Paris nous appartient",
      "movie_wikidata": "https://www.wikidata.org/wiki/Q25513",
      "director": "Jacques Rivette",
      "director_viaf": "http://viaf.org/viaf/84270544",
      "production_year": 1961,
      "film_scene_description": "Anne visits the Sorbonne chapel while investigating the mysterious circumstances surrounding Juan's death.",
      "starring": "Betty Schneider, Giani Esposito, Françoise Prévost",
      "duration": "140min",
      "genre": "drama",
      "production": "Ajym Films, Les Films du Carrosse",
      "cinematographer": "Charles L. Bitsch",
      "film_poster_url": "img/img_movie/chapelleDeLaSorbonneOld.jpg"
    }
  ],
  "image_url": "img/img_movie/chapelleDeLaSorbonneModern.png",
  "tones": {
    "adult": {
      "simple_description": "The private chapel of the Sorbonne University in Paris.",
      "medium_description": "A historic Parisian chapel completed in 1642 at the request of Cardinal Richelieu. It represents an important example of French Baroque architecture in the heart of the Latin Quarter.",
      "detailed_description": "The Chapelle de la Sorbonne is a masterpiece of French Baroque architecture, designed by the architect Jacques Lemercier and completed in 1642. It was commissioned by Cardinal Richelieu, whose remains still rest today in the mausoleum within the nave. The structure is distinguished by its elegant dome, which was one of the first of its kind to be built in Paris, and is one of the intellectual symbols of the city."
    },
    "child": {
      "simple_description": "A cool historic church located inside Paris's famous university!",
      "medium_description": "Built way back in 1642 for Cardinal Richelieu, this church has a giant dome that looks like a king's crown in the middle of the student district.",
      "detailed_description": "Imagine stepping into a university chapel built over 350 years ago! Designed by Jacques Lemercier in 1642, it holds the tomb of Cardinal Richelieu. Its high round dome was one of the very first built in Paris, making it look like a magical castle tower where scholars studied ancient secrets."
    },
    "professional": {
      "simple_description": "A monumental French Baroque ecclesiastical structure within the Sorbonne complex.",
      "medium_description": "Designed by Jacques Lemercier and consecrated in 1642, the Sorbonne Chapel stands as a pivotal milestone of French Classical Baroque architectural style, commissioned by Cardinal Richelieu.",
      "detailed_description": "The Chapelle de la Sorbonne (1635–1642) represents a stylistic synthesis of Roman Baroque influence and traditional French double-tiered classical facades. Architect Jacques Lemercier designed the hemispherical dome over a double-drum, setting an architectural precedent for Parisian monumental domes. Featured prominently in Jacques Rivette's 'Paris nous appartient' (1961), the location evokes the intellectual and existential paranoia characteristic of early French New Wave cinema."
    }
  }
}
```

---

### 4.3 Curated Narrative Itineraries (`data/tour_data.json`)
Defines 6 structured narrative tours across Paris:
- `tour_id`: Unique integer identifier.
- `tour_name`: Full descriptive title.
- `keywords`: Identifier string used for URL query parameter matching and GeoJSON filtering.
- `description`: Introductory curatorial text.
- `pills`: Three quick-read badge strings (Duration, Mobility/Accessibility, Time of Day).
- `locations`: Ordered array of tour stops, each containing `location_id`, `location_name`, and dedicated `text`.

#### Summary of the 6 Curated Tours:

| ID | Tour Name | Keyword Parameter | Stops | Metadata Pills |
|---|---|---|:---:|---|
| 1 | Nouvelle Vague Tour: Jean-Luc Godard | `Jean-Luc Godard` | 11 | 1 Hour, Accessible, Day |
| 2 | Nouvelle Vague Tour: Agnès Varda | `Agnès Varda` | 3 | 45 Min, Walking, Afternoon |
| 3 | Top 10 Locations in Paris | `Top 10 locations` | 10 | 2 Hours, Mixed Transit, Full Day |
| 4 | Cinematic Churches of Paris | `Cinematic Churches` | 4 | 1.5 Hours, Accessible, Morning |
| 5 | Hidden Gems of Paris | `Hidden Gems` | 5 | 1.5 Hours, Walking, Sunset |
| 6 | Montmartre District | `Montmartre District` | 3 | 1 Hour, Hills/Stairs, Afternoon |

---

## 5. Client-Side Application Logic

JavaScript code is separated into two clean, self-contained modules adhering to modern async/await patterns.

```
                    ┌─────────────────────────┐
                    │  DOM Event Listener     │
                    │   (DOMContentLoaded)    │
                    └────────────┬────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       [ Restore Theme from ]          [ Read data-page on <body> ]
       [   localStorage     ]                    │
                                     ┌───────────┴───────────┐
                                     ▼                       ▼
                              pages.catalogue()        pages.tour()
```

---

### 5.1 Multi-Page Controller & Tour Engine (`script/scripts.js`)
793 lines of code implementing four core subsystems:

1. **Page Routing via Dataset (`pages` dictionary)**:
   Dispatches execution on `DOMContentLoaded` depending on whether `body[data-page]` is `catalogue` or `tour`.
2. **Global Theme Switcher & Storage Persistence**:
   - Checks `localStorage.getItem('fileTheme')` and assigns it to `<link id="stylesheet_file">`.
   - Binds event listeners to the floating theme button (`.closeTheme`), open menu (`.openTheme`), and theme triggers (`.btn-tema`).
3. **Catalogue Engine & State (`catalogueState`)**:
   - Manages state: `allLocations`, `currentPage`, `itemsPerPage: 9`.
   - `getPaginationRange(current, total)`: Sliding-window algorithm computing visible page numbers and ellipsis separators (`'...'`).
   - `renderCatalogueCards()`: Generates responsive Bootstrap card markup with image error fallbacks and sanitized links.
   - Desktop sidebar toggle handler adding/removing `.collapsed-desktop`.
4. **Interactive Tour Engine**:
   - Parses `keyword` query parameter via `URLSearchParams`.
   - Fetches and cross-references `data/tour_data.json` and `data/paris.geojson`.
   - `normalizeTourName()` and `sortFeaturesByTourOrder()`: Robust string normalization (stripping accents and non-alphanumeric characters) ensuring that GeoJSON spatial markers strictly match the narrative sequence defined in `tour_data.json`.
   - UI Synchronization: `showParagraph()` coordinates `updateLocationTexts()`, `updateBtnStatus()`, `updateProgressBar()`, and camera flight animations (`mapTour.flyTo()`).

---

### 5.2 Advanced Cartography Engine (`script/map_scripts.js`)
981 lines of code orchestrating the interactive map experience:

1. **Map Setup & Control Placement**:
   - Custom `L.control` containers for Search, Filters, and Explore placed in `topleft`.
   - Native Leaflet zoom control repositioned to `bottomright`.
2. **Leaflet.PinSearch Integration & Overrides**:
   - `searchBar._populateMarkerLabels`: Programmatically extracts all unique monument names.
   - `handleSearch`: Searches the active layer; if a location is currently hidden by an active filter, it resets filters to `"Any"`, restores all markers, centers on the point, and opens the detail panel.
3. **Dynamic Multi-Criteria Filter Engine**:
   - Dynamically scans GeoJSON dataset to build unique director sets.
   - Dual-predicate evaluation: Director (`selectedDirector`) and Decade Range (`selectedYearRange`, e.g., "1950-1959", "1960-1969").
   - Reconstructs the GeoJSON layer and recalibrates view boundaries via `map.fitBounds()`.
4. **Cinematic Itinerary Routing with `Leaflet Routing Machine` (`drawPath`)**:
   - When a specific director is filtered, converts their filming locations into sequential waypoints and renders an itinerary route line in signature red (`#E32636`, 4px weight).
   - Suppresses default waypoint markers to keep custom location pins intact.
5. **3-Tier Progressive Disclosure Text Reader**:
   - `showLocationDetails(locationName)` mounts `#testo-breve`, `#testo-medio`, and `#testo-lungo`.
   - Manages circular state transitions via `#btn-scopri`:
     - State 1 (Short) $\rightarrow$ Click $\rightarrow$ Displays Medium
     - State 2 (Medium) $\rightarrow$ Click $\rightarrow$ Displays Long & updates label to "Show less"
     - State 3 (Long) $\rightarrow$ Click $\rightarrow$ Cycles back to Short & resets label to "Learn more"
6. **Dynamic Movie Details (`showFilmDetails`)**:
   - Populates film-specific scene descriptions, release years, directors, and vintage movie posters.

---

## 6. Design System and Dynamic CSS Theming

### 6.1 The Wordplay "Les Rues du CSS"
The project title carries a deliberate double meaning:
- **Cinematic Acronym**: *Cinéma Sur la Seine* (cinema along the Seine and throughout Parisian avenues).
- **Technological Acronym**: *Cascading Style Sheets* (the styling backbone of the World Wide Web).

The site serves as a live demonstration of CSS architecture: **one unchanged HTML semantic structure styled into 6 radically different visual worlds**.

---

### 6.2 Detailed Review of the 6 Custom Themes

All stylesheets are located in `styles/` and feature custom variables, typography, border styling, animations, and color palettes:

```
┌───────────────────────────┬───────────────────────────┬───────────────────────────┐
│       1. SOLARPUNK        │    2. NOUVELLE VAGUE      │        3. EIGHTIES        │
│    (solarpunk_theme.css)  │ (nouvelle_vague_theme.css)│    (eighties_theme.css)   │
│ - Earthy green & warm hues│ - Pure monochrome B&W     │ - Synthwave / Retro Neon  │
│ - Eco-optimistic design   │ - Editorial sophistication│ - Cyan & magenta neon     │
│ - Organic sans-serif font │ - Classic Didot serif     │ - Pixelated VT323 font    │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│       4. FUTURISM         │      5. MECHANICUM        │        6. ROCOCO          │
│    (futurism_theme.css)   │   (mechanicum_theme.css)  │     (rococo_theme.css)    │
│ - Angular geometries      │ - Brass, rust & iron      │ - Cream pastel & gold     │
│ - Speed lines & diagonals │ - Dark industrial gothic  │ - Flourishes & ornaments  │
│ - Heavy Anton typography  │ - Technical monospaced    │ - Pinyon Script cursive   │
└───────────────────────────┴───────────────────────────┴───────────────────────────┘
```

1. **Solarpunk (`solarpunk_theme.css`) - Default**:
   - *Concept:* An eco-optimistic aesthetic where nature and technology coexist harmoniously, blending Art Nouveau curves with modern sustainability motifs.
   - *Palette:* Sage green, warm terracotta, soft ochre, light timber accents.
   - *Typography:* Clean, highly legible sans-serif fonts (`Inter`, `Montserrat`).
2. **Nouvelle Vague (`nouvelle_vague_theme.css`)**:
   - *Concept:* A homage to 1960s French cinematic aesthetics, black-and-white celluloid film grain, and the intellectual editorial style of *Cahiers du Cinéma*.
   - *Palette:* High-contrast black, crisp paper white, and subtle slate tones.
   - *Typography:* High-contrast neoclassical serif `GFS Didot`.
3. **Eighties (`eighties_theme.css`)**:
   - *Concept:* 1980s arcade culture, synthwave, neon glow, and cathode-ray tube (CRT) terminal aesthetics.
   - *Palette:* Deep obsidian background accented with electric cyan (`#00ffff`) and hot magenta (`#ff00ff`).
   - *Typography:* 8-bit dot-matrix font `VT323` and `Space Mono`.
4. **Futurism (`futurism_theme.css`)**:
   - *Concept:* Early 20th-century Italian Futurism celebrating machine speed, dynamic energy, diagonal planes, and industrial force.
   - *Palette:* Sharp contrasts between industrial charcoal, blazing crimson, and warning yellow.
   - *Typography:* Heavy display typeface `Anton` paired with angular accents.
5. **Mechanicum (`mechanicum_theme.css`)**:
   - *Concept:* Dark industrial gothic, steampunk/dieselpunk engineering, and the veneration of the machine (inspired by the Warhammer 40,000 Adeptus Mechanicus).
   - *Palette:* Cast iron, tarnished brass, oxidised rust, and incandescent orange indicator lights.
   - *Typography:* Monospaced code-inspired typography (`Space Mono`).
6. **Rococo (`rococo_theme.css`)**:
   - *Concept:* 18th-century French aristocratic elegance, pastel lightness, and ornamental grace.
   - *Palette:* Powder pink, mint green, creamy ivory, and warm gold highlights.
   - *Typography:* Flowing calligraphy `Pinyon Script` paired with `Playfair Display`.

---

### 6.3 Typography, Iconography, and UI Framework

- **Google Fonts Suite:**
  - `Anton`: Heavy display sans-serif (Futurism theme).
  - `GFS Didot`: High-contrast neoclassical serif (Nouvelle Vague theme).
  - `Inter` & `Montserrat`: Modern UI sans-serif fonts for body copy.
  - `Pinyon Script`: French calligraphic cursive (Rococo theme).
  - `Playfair Display`: High-elegance editorial serif.
  - `Space Mono`: Geometric monospaced font (Eighties & Mechanicum themes).
  - `VT323`: 8-bit retro terminal bitmap font (Eighties theme).
- **Icon Suites:**
  - `Bootstrap Icons (v1.11.3)`: Used for navigational arrows, badges, and controls.
  - `Material Symbols Outlined`: Used for the theme switcher palette icon (`palette`), outdoor transit icons (`hiking`), and daylight badges (`clear_day`, `moon_stars`).
- **CSS Framework:**
  - `Bootstrap 5.3.x`: Provides normalized CSS resets, 12-column grid layout, flexbox utilities, and accessible UI components (collapses, dropdowns, offcanvas).

---

## 7. Multimedia Integration and Visual Assets

The `img/` folder hosts a carefully curated photographic corpus:

1. **Comparative "Then and Now" Archive (`img/img_movie/`)**:
   Each location contains two synchronized visual records:
   - `*Old.*` files (e.g., `louvreOld.jpeg`, `arcDeTriompheOld.jpg`): Original 1950s/1960s film frames or historical archival photos.
   - `*Modern.*` files (e.g., `louvreModern.png`, `arcDeTriompheModern.jpg`): Contemporary photography of the exact same angle and perspective.
2. **Key Directors and Figures**:
   - `Truffaut.jpg`: François Truffaut photographed by Pierre Zucca during the promotion of *Baisers volés*.
   - `Jean-Luc-Godard.jpg`: Jean-Luc Godard operating a handheld camera on the streets of Paris in 1968.
   - `agnes_varda.jpg`: Pioneering Left Bank director Agnès Varda.
   - `andre-bazin.jpg`: Film critic, co-founder of *Cahiers du Cinéma*, and theorist of auteur cinema.
3. **Branding Assets**:
   - `S.svg` & `S.png`: Project logo representing the curve of the Seine and the cinema reel.
   - `generic_bg.png`: Graceful fallback banner displayed in case of network interruptions.

---

## 8. Deployment Pipeline and CI/CD

Continuous Integration and Continuous Deployment are managed automatically via **GitHub Actions** in [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml):

```yaml
name: Deploy static content to Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del codice
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
      - name: Configura GitHub Pages
        uses: actions/configure-pages@v5
      - name: Carica i file (Artifact)
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'
      - name: Deploy su GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Pipeline Characteristics:
- **Push Trigger:** Automatically builds and updates the live site upon every push or merge to `main`.
- **Manual Trigger:** Supports manual dispatch from GitHub's Actions dashboard (`workflow_dispatch`).
- **OIDC Security:** Leverages OpenID Connect token exchange for secure publishing to the `github-pages` environment.
- **Zero Build Time:** Deploys raw static files in seconds without intermediate compilation steps.

---

## 9. Local Development and Setup Guide

Because the application fetches external `.json` and `.geojson` data using the browser's asynchronous `fetch()` API, standard browser security policies (CORS) block execution when loaded directly via `file:///`. It must be served through a local HTTP server.

### Option 1: Python 3 (Recommended)
Open a terminal in the project root directory and run:

```bash
# Start a local HTTP server on port 8000
python -m http.server 8000
```
Open your browser and navigate to: `http://localhost:8000`

### Option 2: Node.js / npx
```bash
# Instant local web server using serve
npx serve .
```

### Option 3: Visual Studio Code (Live Server)
1. Open the `project_Web_Technologies` folder in Visual Studio Code.
2. Install the **Live Server** extension by Ritwick Dey.
3. Right-click `index.html` and click **"Open with Live Server"**.

---

## Conclusion and Acknowledgments

**Les Rues du CSS** bridges humanistic cinema scholarship with modern web engineering, showing how digital heritage platforms can transform passive archival information into dynamic, immersive spatial narratives.

Special thanks to **Prof. Fabio Vitali** for pedagogical and technical guidance throughout the course, and to the **Cinémathèque Française** for preserving the rich historical heritage of the Nouvelle Vague.
