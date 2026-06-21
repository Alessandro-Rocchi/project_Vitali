
document.addEventListener('DOMContentLoaded', () => {
    //FOR CHANGING THEME
    const closeBtn = document.querySelector('.closeTheme');
    const openBtn = document.querySelector('.openTheme');

    // Only add listeners if the elements actually exist on the page
    if (closeBtn && openBtn) {
        closeBtn.addEventListener('click', () => {
            closeBtn.style.display = 'none';
            openBtn.style.display = 'block';
        });

        openBtn.addEventListener('click', () => {
            openBtn.style.display = 'none';
            closeBtn.style.display = 'block';
        });
    }


    //FOR PAGINATION
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
        }; // This closes pg.onclick
    } 

    //PER I BOTTONI PAGINA TOUR

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

    updateBtnStatus(); // Inizialmente aggiorniamo lo stato dei bottoni



    
});








