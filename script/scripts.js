document.querySelector('.closeTheme').addEventListener('click', () => {
    document.querySelector('.closeTheme').style.display = 'none';
    document.querySelector('.openTheme').style.display = 'block';
});
document.querySelector('.openTheme').addEventListener('click', () => {
    document.querySelector('.openTheme').style.display = 'none';
    document.querySelector('.closeTheme').style.display = 'block';
});


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

/*const arrowIcon = document.getElementById('arrow_forward_ios')
function rotateIcon() {
    arrowIcon.addEventListener('click', () => {
        arrowIcon.style.setProperty('rotate', '180deg')
    })
}*/


//----------------JAVASCRIPT PAGINA TOUR + THEME CHANGE-------------------

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

