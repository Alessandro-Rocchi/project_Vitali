let map = null;
let tourLayers = [];
let currentTourData = null;
let currentTourIndex = 0; 

const pages = {
    catalogue: () => {
        const desktopToggleBtn = document.getElementById("desktop_filter_toggle");
        const filterSidebar = document.getElementById("filters_menu");
            
        if (desktopToggleBtn && filterSidebar) {
            desktopToggleBtn.addEventListener("click", () => {
                filterSidebar.classList.toggle("collapsed-desktop");
                desktopToggleBtn.classList.toggle("is-open");
            });
        }

        const paginationContainer = document.getElementById('pagination');
        if (paginationContainer) {
            paginationContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn || btn.disabled) return;

                const totalPages = Math.ceil(catalogueState.allLocations.length / catalogueState.itemsPerPage) || 1;
                let targetPage = catalogueState.currentPage;

                if (btn.classList.contains('arrow')) {
                    const dir = parseInt(btn.dataset.dir, 10);
                    targetPage += dir;
                } else if (btn.dataset.page) {
                    targetPage = parseInt(btn.dataset.page, 10);
                }

                if (targetPage >= 1 && targetPage <= totalPages && targetPage !== catalogueState.currentPage) {
                    displayCataloguePage(targetPage);

                    const titleOrCards = document.getElementById('catalogue_page_title') || document.getElementById('cardSection');
                    if (titleOrCards) {
                        titleOrCards.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        }

        loadJson().then(locations => {
            if (locations && locations.length > 0) {
                catalogueState.allLocations = locations;
                displayCataloguePage(1);
            } else {
                renderCatalogueCards([]);
            }
        });
    },
    
    tour: async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const targetKeyword = urlParams.get('regista');
        
        map = L.map("map", { zoomControl: false }).setView([48.8566, 2.3522], 13);
            
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 12,
            maxZoom: 17,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        const filteredGeoData = await filteredLoadGeoData(targetKeyword);
        if (filteredGeoData) {
            addGeoData(filteredGeoData);
        }
        
        currentTourData = await loadTourTextData(targetKeyword); 
        currentTourIndex = 0;

        if (currentTourData && currentTourData.locations.length > 0) {
            showParagraph(0);
        }

        const prevButtons = document.querySelectorAll('#btn-prev, #btn-prev-mobile');
        const nextButtons = document.querySelectorAll('#btn-next, #btn-next-mobile');

        updateProgressBar();

        nextButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (currentTourData && currentTourIndex < currentTourData.locations.length - 1){
                    currentTourIndex++;
                    goToLocation(currentTourIndex);
                    showParagraph(currentTourIndex);
                }
            });
        });

        prevButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (currentTourIndex > 0){
                    currentTourIndex--;
                    goToLocation(currentTourIndex);
                    showParagraph(currentTourIndex);
                }
            });
        });

        const backToFirstBtn = document.getElementById('backToFirst');
        if (backToFirstBtn) {
            backToFirstBtn.addEventListener('click', () => {
                currentTourIndex = 0;
                showParagraph(currentTourIndex);
                goToLocation(currentTourIndex);
            });
        }

        updateBtnStatus();
    }
};

function updateBtnStatus() {
    if (!currentTourData) return;

    const prevButtons = document.querySelectorAll('#btn-prev, #btn-prev-mobile');
    const nextButtons = document.querySelectorAll('#btn-next, #btn-next-mobile');
    const backToFirstBtn = document.getElementById('backToFirst');

    prevButtons.forEach(button => {
        button.disabled = (currentTourIndex === 0);
    });
    nextButtons.forEach(button => {
        button.disabled = (currentTourIndex === currentTourData.locations.length - 1);
    });

    if (backToFirstBtn) {
        if (currentTourIndex === 0) {
            const buttonHeight = backToFirstBtn.offsetHeight;
            backToFirstBtn.style.setProperty('display', 'none', 'important');
            const container = document.getElementById('backToFirstContainer');
            if (container && buttonHeight > 0) container.style.height = buttonHeight + 'px';
            backToFirstBtn.style.setProperty('animation', 'fade 1s ease forwards', 'important');
        } else {
            backToFirstBtn.style.setProperty('display', 'inline-flex', 'important');    
            const container = document.getElementById('backToFirstContainer');
            if (container) container.style.height = 'auto';
        }
    }
}

function updateProgressBar() {
    const progress = document.querySelector('.progress-bar');
    if (progress && currentTourData) {
        progress.style.width = ((currentTourIndex + 1) / currentTourData.locations.length * 100) + '%';
    }
}

function showParagraph(newIndex) {
    updateLocationTexts(newIndex);
    updateBtnStatus();
    updateProgressBar();
}

function loadJson() {
    return fetch("data/paris_metadata.json")
        .then(function(response) {
            if (!response.ok) throw new Error("HTTP error " + response.status);
            return response.json();
        })
        .catch(function(error) {
            console.error("Fetch error metadata: ", error);
            return [];
        });
}

async function loadTourTextData(targetKeyword) {
    try {
        const response = await fetch('data/tour_data.json'); 
        const toursArray = await response.json();

        let filteredTourData = toursArray.find(tour => tour.keywords === targetKeyword);

        if (filteredTourData) {
            const titleSect = document.getElementById('title-section');
            const descSect = document.getElementById('description-section');
            const pillSecOne = document.getElementById('pillsOneSection')
            const pillSecTwo = document.getElementById('pillsTwoSection')
            const pillSecThree = document.getElementById('pillsThreeSection')
            if (titleSect) titleSect.innerHTML = `<h2>${filteredTourData.tour_name}</h2>`;
            if (descSect) descSect.innerHTML = `<p>${filteredTourData.description}</p>`;
            if (pillSecOne) pillSecOne.innerHTML = `${filteredTourData.pills[0]}`;
            if (pillSecTwo) pillSecTwo.innerHTML = `${filteredTourData.pills[1]}`;
            if (pillSecThree) pillSecThree.innerHTML = `${filteredTourData.pills[2]}`;

            return filteredTourData;
        } else {
            console.warn("Nessun tour trovato per:", targetKeyword);
            return null;
        }
    } catch (error) {
        console.error("Errore nel fetch del file JSON testuale:", error);
        return null;
    }
}

function filteredLoadGeoData(targetKeyword) {
    return fetch("data/paris.geojson")
        .then(function(response){
            if (!response.ok) throw new Error("HTTP error " + response.status);
            return response.json();
        })
        .then(data => {
            const filteredFeatures = data.features.filter(feature => 
                    feature.properties.director && 
                    feature.properties.director === targetKeyword
            );
            return { ...data, features: filteredFeatures };
        })
        .catch(function(error){
            console.error("Fetch error GeoJSON: ", error);
            return null;
        });
}

function addGeoData(geojson) {
    if (!geojson || geojson.features.length === 0) return;
    tourLayers = [];
    const currentLayer = L.geoJSON(geojson, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup(createPopupContent(feature));
            tourLayers.push(layer);
        }
    }).addTo(map);

    if (tourLayers.length > 0) {
        goToLocation(0);
    }
}

function goToLocation(index) {
    if (!tourLayers[index]) return;
    const targetLayer = tourLayers[index];
    map.flyTo(targetLayer.getLatLng(), 16, { animate: true, duration: 1.5 });
    targetLayer.openPopup();
}

function createPopupContent(feature) {
    var props = feature.properties || {};
    var safeName = (props.name || '').replace(/'/g, "\\'");
    return `<div class="card" style="width: 18rem;">
                <div class="card-body">
                    <h5 class="card-title">${props.name || 'Location'}</h5>
                    <p class="card-text mb-1"><b>Director:</b> ${props.director || 'N/A'}</p>
                    <p class="card-text mb-1"><b>Year:</b> ${props.production_year || 'N/A'}</p>
                    <p class="card-text mb-2"><b>Associated Film:</b> ${props.movie || 'N/A'}</p>
                </div>
            </div>`;
}

function updateLocationTexts(index) {
    if (!currentTourData || !currentTourData.locations[index]) return;
    const currentLocation = currentTourData.locations[index];
    const textInfo = document.getElementById('text-section');
    if (textInfo) {
        textInfo.innerHTML = `
            <h3>${currentLocation.location_name}</h3>
            <p>${currentLocation.text}</p>
        `;
    }
}

const catalogueState = {
    allLocations: [],
    currentPage: 1,
    itemsPerPage: 9
};

function displayCataloguePage(page) {
    const totalItems = catalogueState.allLocations.length;
    const totalPages = Math.ceil(totalItems / catalogueState.itemsPerPage) || 1;

    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    catalogueState.currentPage = page;

    const startIndex = (page - 1) * catalogueState.itemsPerPage;
    const endIndex = Math.min(startIndex + catalogueState.itemsPerPage, totalItems);
    const pageLocations = catalogueState.allLocations.slice(startIndex, endIndex);

    renderCatalogueCards(pageLocations);

    const catalogueTitle = document.querySelector("#catalogue_page_title h2");
    if (catalogueTitle) {
        if (totalItems === 0) {
            catalogueTitle.textContent = "0 locations shown";
        } else {
            catalogueTitle.textContent = `${totalItems} locations shown (Page ${page} of ${totalPages})`;
        }
    }

    renderPagination(totalPages, page);
}

function getPaginationRange(current, total) {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [];
    const showLeftEllipsis = current > 4;
    const showRightEllipsis = current < total - 3;

    if (!showLeftEllipsis && showRightEllipsis) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
    } else if (showLeftEllipsis && !showRightEllipsis) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
        pages.push(1);
        pages.push('...');
        pages.push(current - 1);
        pages.push(current);
        pages.push(current + 1);
        pages.push('...');
        pages.push(total);
    }
    return pages;
}

function renderPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    if (totalPages < 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'arrow';
    prevBtn.dataset.dir = '-1';
    prevBtn.innerHTML = '&laquo;';
    prevBtn.setAttribute('aria-label', 'Previous page');
    if (currentPage <= 1) {
        prevBtn.disabled = true;
    }
    paginationContainer.appendChild(prevBtn);

    const pageRange = getPaginationRange(currentPage, totalPages);
    pageRange.forEach(item => {
        if (item === '...') {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'page-ellipsis';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        } else {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-num${item === currentPage ? ' active' : ''}`;
            pageBtn.dataset.page = item;
            pageBtn.textContent = item;
            pageBtn.setAttribute('aria-label', `Page ${item}`);
            if (item === currentPage) {
                pageBtn.setAttribute('aria-current', 'page');
            }
            paginationContainer.appendChild(pageBtn);
        }
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'arrow';
    nextBtn.dataset.dir = '1';
    nextBtn.innerHTML = '&raquo;';
    nextBtn.setAttribute('aria-label', 'Next page');
    if (currentPage >= totalPages) {
        nextBtn.disabled = true;
    }
    paginationContainer.appendChild(nextBtn);
}

function renderCatalogueCards(locations) {
    const cardSection = document.getElementById("cardSection") || document.querySelector(".row_catalogue");
    if (!cardSection) return;

    cardSection.innerHTML = "";

    if (!locations || locations.length === 0) {
        cardSection.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3 class="mb-3">No locations available</h3>
                <p class="lead">No locations are currently available for display.</p>
            </div>
        `;
        return;
    }

    locations.forEach(location => {
        const col = document.createElement("div");
        col.className = "col-sm-12 col-md-6 col-lg-4 col-xl-4";

        const imgUrl = location.image_url || "img/generic_bg.png";
        const title = location.name || "Location";
        const desc = location.simple_description || location.medium_description || "";

        col.innerHTML = `
            <div class="card border rounded h-100">
                <img src="${imgUrl}" class="img-fluid" alt="${title}" onerror="this.onerror=null;this.src='img/generic_bg.png';">
                <h5 class="ps-2 my-2 mx-1">${title}</h5>
                <p class="ps-2 my-2 mx-1">${desc}</p>
                <a href="map.html" class="card_link align-self-end mt-auto pe-2 my-2 mx-1 d-flex align-items-center">
                    Go to the map<span class="material-symbols-outlined arrow_forward_ios card_arrow">arrow_forward_ios</span>
                </a>
            </div>
        `;
        cardSection.appendChild(col);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.dataset.page;    
    const closeThemeBtn = document.querySelector('.closeTheme');
    const openThemeMenu = document.querySelector('.openTheme');
    const linkCSS = document.getElementById('stylesheet_file');

    if (linkCSS) {
        const savedTheme = localStorage.getItem('fileTheme');
        if (savedTheme) {
            linkCSS.setAttribute('href', savedTheme);
        }
    }

    if (closeThemeBtn && openThemeMenu) {
        closeThemeBtn.addEventListener('click', () => {
            closeThemeBtn.style.display = 'none';
            openThemeMenu.style.display = 'block';
        });

        openThemeMenu.addEventListener('click', (event) => {
            const btnTema = event.target.closest('.btn-tema');
            if (btnTema) {
                event.stopPropagation(); 
                const choosenFile = btnTema.getAttribute('data-file');
                if (choosenFile && linkCSS) {
                    linkCSS.setAttribute('href', choosenFile);
                    localStorage.setItem('fileTheme', choosenFile);
                }
                openThemeMenu.style.display = 'none';
                closeThemeBtn.style.display = 'block';
                return;
            }

            const btnChiudiMenu = event.target.closest('.btn-chiudi');
            if (btnChiudiMenu) {
                event.stopPropagation();
                openThemeMenu.style.display = 'none';
                closeThemeBtn.style.display = 'block';
            }
        });
    }
    
    if (currentPage && pages[currentPage]) {
        pages[currentPage]();
    }
});