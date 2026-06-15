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
