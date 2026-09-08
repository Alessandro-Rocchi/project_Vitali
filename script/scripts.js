const pages = {
    catalogue: () => {
        
        const pg = document.getElementById('pagination');
        if (pg) {
            const nums = [...pg.querySelectorAll('.page-num')];

            pg.onclick = (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;

                const active = pg.querySelector('.active');
                const nextIdx = btn.classList.contains('arrow') 
                    ? nums.indexOf(active) + +btn.dataset.dir 
                    : nums.indexOf(btn);

                if (nums[nextIdx]) {
                    active.classList.remove('active');
                    nums[nextIdx].classList.add('active');
                }
            };
        } 

        const desktopToggleBtn = document.getElementById("desktop_filter_toggle");
        const filterSidebar = document.getElementById("filters_menu");
            
        if (desktopToggleBtn && filterSidebar) {
            desktopToggleBtn.addEventListener("click", () => {
                filterSidebar.classList.toggle("collapsed-desktop");
                desktopToggleBtn.classList.toggle("is-open");
            });
        }

        loadJson().then(locations => {
            if (locations && locations.length > 0) {
                renderCatalogueCards(locations);
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

function renderCatalogueCards(locations) {
    const cardSection = document.getElementById("cardSection") || document.querySelector(".row_catalogue");
    if (!cardSection) return;

    cardSection.innerHTML = "";

    locations.forEach(location => {
        const col = document.createElement("div");
        col.className = "col-sm-12 col-md-6 col-lg-4 col-xl-3";

        const imgUrl = location.image_url || "img/generic_bg.png";
        const title = location.name || "Luogo";
        const desc = location.simple_description || location.medium_description || "";

        col.innerHTML = `
            <div class="card border rounded h-100">
                <img src="${imgUrl}" class="img-fluid" alt="${title}" onerror="this.onerror=null;this.src='img/generic_bg.png';">
                <h5 class="ps-2 my-2 mx-1">${title}</h5>
                <p class="ps-2 my-2 mx-1">${desc}</p>
                <a href="map.html" class="card_link align-self-end mt-auto pe-2 my-2 mx-1 d-flex align-items-center">
                    Vai alla mappa<span class="material-symbols-outlined arrow_forward_ios card_arrow">arrow_forward_ios</span>
                </a>
            </div>
        `;
        cardSection.appendChild(col);
    });

    const countTitle = document.querySelector("#catalogue_page_title h2");
    if (countTitle) {
        countTitle.textContent = `${locations.length} luoghi mostrati`;
    }
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


    const btnTheme = document.querySelectorAll('.btn-tema');

    btnTheme.forEach(bottone => {
        bottone.addEventListener('click', (event) => {
            event.stopPropagation(); 

            const choosenFile = bottone.getAttribute('data-file');

            if (choosenFile) {
                linkCSS.setAttribute('href', choosenFile);
                localStorage.setItem('fileTheme', choosenFile);
            }

            openThemeMenu.style.display = 'none';
            closeThemeBtn.style.display = 'block';
        });
    }); 

    const btnChiudiMenu = document.querySelector('.btn-chiudi');

    btnChiudiMenu.addEventListener('click', (event) => {
        event.stopPropagation(); 
        // Nasconde il menu aperto e rimostra il bottone iniziale
        openThemeMenu.style.display = 'none';
        closeThemeBtn.style.display = 'block';
    });
    
    if (pages[currentPage]) {
    pages[currentPage]();
  }
});
