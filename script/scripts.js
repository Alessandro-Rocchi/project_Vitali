const filterArea = document.getElementById("filter_area")
const cardsArea = document.getElementById("cards_area")
const toggleBtn = document.getElementById("filter_toggle")
const filterIcon = document.getElementById("filter_list")
        // 2. Ascoltiamo il click sul bottone
toggleBtn.addEventListener('click', () => {
        tiPregoFunziona(filterArea, cardsArea, filterIcon);
});

function tiPregoFunziona(filterArea, cardsArea, filterIcon) {
    if (filterArea.classList.contains('col-1')) {
        filterArea.classList.replace('col-1', 'col-3');
        cardsArea.classList.replace('col-11', 'col-8');
        filterIcon.remove();
        } else {
            filterArea.classList.replace('col-3', 'col-1');
            cardsArea.classList.replace('col-8', 'col-11');
            setTimeout(() => {
                    document.getElementById('arrow_forward_ios').before(filterIcon);
                }, 400);
            }
        }

document.addEventListener('DOMContentLoaded', () => {
    // Selezioniamo gli elementi del menu
    const closeThemeBtn = document.querySelector('.closeTheme');
    const openThemeMenu = document.querySelector('.openTheme');
    
    // Selezioniamo il tag <link> del CSS nel head
    const linkCSS = document.getElementById('foglio-stile');

    // --- 1. RIPRISTINO DEL TEMA SALVATO ---
    // Controlliamo se l'utente aveva scelto un tema in precedenza
    const temaSalvato = localStorage.getItem('fileTema');
    if (temaSalvato) {
        linkCSS.setAttribute('href', temaSalvato);
    }

    // --- 2. APERTURA/CHIUSURA MENU (Il tuo codice corretto) ---
    closeThemeBtn.addEventListener('click', () => {
        closeThemeBtn.style.display = 'none';
        openThemeMenu.style.display = 'block';
    });


    // --- 3. CAMBIO TEMA MULTIPLO ---
    // Selezioniamo TUTTE le icone che hanno la classe 'btn-tema'
    const bottoniTema = document.querySelectorAll('.btn-tema');

    bottoniTema.forEach(bottone => {
        bottone.addEventListener('click', (event) => {
            // Evita che il click sul bottone attivi altri eventi strani
            event.stopPropagation(); 

            // Leggiamo il percorso del file CSS scritto nel "data-file" dell'icona cliccata
            const fileScelto = bottone.getAttribute('data-file');

            // Sostituiamo il foglio di stile corrente con quello nuovo
            linkCSS.setAttribute('href', fileScelto);

            // Salviamo la scelta nel browser così non si perde al ricaricamento
            localStorage.setItem('fileTema', fileScelto);

            // Una volta scelto il tema, chiudiamo il menu e mostriamo di nuovo l'icona principale
            openThemeMenu.style.display = 'none';
            closeThemeBtn.style.display = 'block';
        });
    });
});