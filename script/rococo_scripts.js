const pg = document.getElementById('pagination');
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
