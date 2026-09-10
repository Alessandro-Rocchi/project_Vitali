# Les Rues du CSS (Cinéma Sur la Seine) - Documentation

## Project Overview
"Les Rues du CSS" is an interactive web platform designed to map and analyze the real locations of the French New Wave (Nouvelle Vague) movement within the urban fabric of Paris. It connects physical space to the scenes that redefined global cinema, allowing users to explore the overlap between real Parisian topography and its transfiguration on the big screen.

## Project Specification and Details
The project consists of several core pages, each offering a unique way to interact with the geo-cinematographic data:

- **Home Page (`index.html`)**: Introduces the project's purpose and provides quick links to explore the map and the catalogue.
- **Interactive Map (`map.html`)**: A Leaflet-powered map displaying locations associated with Nouvelle Vague films. It features:
  - Custom UI panels for searching (PinSearch), filtering by director and year, and exploring curated thematic itineraries.
  - Interactive popups displaying location details, movie associations, and production years.
  - Route drawing (using Leaflet Routing Machine) to visualize paths between locations when filtered by a specific director.
- **Catalogue (`catalogue.html`)**: A paginated view of all cinematic locations, presented as cards. It includes:
  - Responsive offcanvas filters on mobile devices and a collapsible sidebar on desktop.
  - Sorting and filtering options to easily find specific locations.
- **About Page (`about_nouvelle_vague.html`)**: A detailed historical overview of the Nouvelle Vague movement, complete with an embedded KnightLab interactive timeline to trace the movement's evolution.
- **Theme Switcher**: An interactive feature available across all pages, allowing users to switch between different CSS themes (Solarpunk, Mechanicum, Nouvelle Vague, Eighties, Futurism, Rococo) dynamically.

## Technological Stack and Architecture
The project is built using a modern, lightweight frontend stack without a complex backend, relying on client-side data fetching:

- **HTML5 & CSS3**: Core markup and styling. Custom themes are implemented via interchangeable CSS files.
- **Bootstrap 5.3.3**: Used for responsive design, grid layouts, and interactive components like offcanvas menus, dropdowns, and modals.
- **JavaScript (Vanilla)**: Handles application logic, DOM manipulation, theme switching, and data fetching.
- **Leaflet (1.9.4)**: The core mapping library.
  - **Leaflet Routing Machine**: Used to draw paths between locations.
  - **Leaflet PinSearch**: Provides the search functionality within the map.
- **KnightLab Timeline**: Embedded via an iframe to display the historical timeline on the About page.
- **Data Architecture**: Data is loaded asynchronously using the Fetch API from local static files (`data/paris.geojson` for map features and `data/paris_metadata.json` for detailed location information).

## Usability and User Analysis
The platform is designed with a broad audience in mind, focusing on ease of use and accessibility:

- **Target Audience**: Film students, cinephiles, historians, and tourists interested in the cultural history of Paris and the Nouvelle Vague movement.
- **Responsive Design**: The use of Bootstrap ensures the platform is fully usable on both desktop and mobile devices. The map and catalogue interfaces adapt seamlessly to smaller screens (e.g., using offcanvas menus for filters).
- **Interactive Discoverability**: Features like the interactive map with search and filter capabilities, and the paginated catalogue, allow users to discover content organically based on their interests.
- **Thematic Engagement**: The customizable themes offer a playful and engaging user experience, allowing personalization of the interface.

## User Persona

**Name:** Juliette Dubois
**Age:** 24
**Occupation:** Film Studies Master's Student at Sorbonne University & Freelance Photographer
**Background:** Juliette is passionate about European cinema history, particularly the French New Wave. She spends her weekends exploring Paris, trying to capture the essence of the city as seen in her favorite films by Godard and Truffaut.

**Goals:**
- To find specific locations in Paris where iconic Nouvelle Vague scenes were shot.
- To understand the geographical context of these films and how the directors used the urban landscape.
- To have a reliable, easy-to-use tool to plan her walking tours and photography sessions.

**Pain Points:**
- Existing resources are often static, fragmented, or difficult to navigate on a mobile device while walking around the city.
- It is hard to visualize the spatial relationship between different filming locations of a single director or film.

**How "Les Rues du CSS" helps Juliette:**
- The **Interactive Map** allows her to pinpoint locations and filter them by her favorite director (e.g., Jean-Luc Godard), immediately drawing a route she can follow.
- The **mobile-responsive design** means she can comfortably use the Catalogue and Map on her smartphone while exploring Paris.
- The **About Page timeline** provides quick historical context she can reference for her academic essays.
