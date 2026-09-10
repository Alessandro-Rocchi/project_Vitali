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
    tour: () => {
            // Selezioniamo gli elementi dal DOM
        const paragraphs = document.querySelectorAll('.paragraph');
        const prevButtons = document.querySelectorAll('#btn-prev, #btn-prev-mobile');
        const nextButtons = document.querySelectorAll('#btn-next, #btn-next-mobile');

        // Il tuo counter (l'indice del paragrafo corrente)
        let currentIndex = 0;

        //settiamo la barra di progresso
        const progress = document.querySelector('.progress-bar');
        progress.style.width = ((currentIndex + 1) / paragraphs.length * 100) + '%';


        // Funzione per attivare/disattivare i bottoni in base all'indice
        function updateBtnStatus() {
            prevButtons.forEach(button => {
                button.disabled = (currentIndex === 0);
            });
            nextButtons.forEach(button => {
                button.disabled = (currentIndex === paragraphs.length - 1);
            });

            const backToFirstBtn = document.getElementById('backToFirst');
                if (currentIndex == 0) {
                    const buttonHeight = backToFirstBtn.offsetHeight;
                    backToFirstBtn.style.setProperty('display', 'none', 'important');
                    document.getElementById('backToFirstContainer').style.height = buttonHeight + 'px';
                    backToFirstBtn.style.setProperty('animation', 'fade 1s ease forwards', 'important');

                } else {
                    backToFirstBtn.style.setProperty('display', 'inline-flex', 'important');    
                }
        }

        // Funzione che aggiorna la visibilità dei paragrafi
        function showParagraph(newIndex) {
            // Rimuoviamo la classe 'active' dal paragrafo attualmente visibile
            paragraphs[currentIndex].classList.remove('active');
            
            // Aggiorniamo l'indice con quello nuovo
            currentIndex = newIndex;
            
            // Aggiungiamo la classe 'active' al nuovo paragrafo
            paragraphs[currentIndex].classList.add('active');
            
            // Aggiorniamo la barra di progresso
            progress.style.width = ((currentIndex + 1) / paragraphs.length * 100) + '%';
            updateBtnStatus();
        }

        // Evento per il bottone NEXT
        nextButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Calcoliamo il prossimo indice.
                if (currentIndex < paragraphs.length - 1){
                    showParagraph(currentIndex + 1);
                }
            });
        });


        // Evento per il bottone PREVIOUS
        prevButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Calcoliamo l'indice precedente.
                if (currentIndex > 0){
                    showParagraph(currentIndex - 1);
                }
            });
        });


        // Evento per il link "Back to first"
        document.getElementById('backToFirst').addEventListener('click', () => {
            showParagraph(0);
        });

        updateBtnStatus(); // Inizialmente aggiorniamo lo stato dei bottoni  */
    }
};

function loadJson() {
    return fetch("data/paris_metadata.json")
        .then(function(response) {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .catch(function(error) {
            console.error("Fetch error metadata: ", error);
            return [];
        });
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

    // Freccia precedente
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

    // Freccia successiva
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

    const savedTheme = localStorage.getItem('fileTheme');
    if (savedTheme) {
        linkCSS.setAttribute('href', savedTheme);
    }

    closeThemeBtn.addEventListener('click', () => {
        closeThemeBtn.style.display = 'none';
        openThemeMenu.style.display = 'block';
    });


    openThemeMenu.addEventListener('click', (event) => {
        const btnTema = event.target.closest('.btn-tema');
        if (btnTema) {
            event.stopPropagation(); 

            const choosenFile = btnTema.getAttribute('data-file');

            if (choosenFile) {
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
            // Nasconde il menu aperto e rimostra il bottone iniziale
            openThemeMenu.style.display = 'none';
            closeThemeBtn.style.display = 'block';
        }
    });
    
    if (pages[currentPage]) {
    pages[currentPage]();
  }
});
