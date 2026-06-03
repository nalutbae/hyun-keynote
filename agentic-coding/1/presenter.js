(function(){
  const deck = document.getElementById('deck');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const notes = Array.from(document.querySelectorAll('.notes'));
  const total = slides.length;
  const padWidth = String(total).length < 2 ? 2 : String(total).length;
  const progressTotal = formatNumber(total);
  const noteByDataFor = new Map(notes.map(note => [note.dataset.for, note]));
  const slidePairs = slides.map((slide, index) => {
    const ordinal = index + 1;
    const dataNum = slide.dataset.num || String(ordinal);
    const note = noteByDataFor.get(dataNum) || notes[index] || null;
    return {slide, note, ordinal};
  });
  let idx = 0;

  function formatNumber(value){
    return String(value).padStart(padWidth, '0');
  }

  function syncProgress(){
    slidePairs.forEach(({slide, note, ordinal}) => {
      const current = formatNumber(ordinal);
      slide.dataset.num = String(ordinal);

      const progress = slide.querySelector('.meta-bottom > span:last-child');
      if(progress){
        const number = progress.querySelector('.num') || document.createElement('span');
        number.className = 'num';
        number.textContent = current;
        progress.replaceChildren(number, document.createTextNode(` / ${progressTotal}`));
      }

      if(note){
        note.dataset.for = String(ordinal);
        const noteProgress = note.querySelector('.head > span:last-child');
        if(noteProgress){
          noteProgress.textContent = `SLIDE ${current} / ${progressTotal}`;
        }
      }
    });
  }

  function activate(i){
    if(!total) return;
    idx = Math.max(0, Math.min(total - 1, i));
    slides.forEach((slide, k) => slide.classList.toggle('active', k === idx));
    notes.forEach(note => note.classList.remove('active'));
    slidePairs[idx]?.note?.classList.add('active');

    if(document.body.classList.contains('present')){
      const slide = slides[idx];
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const slideWidth = slide.offsetWidth || 1920;
      const slideHeight = slide.offsetHeight || 1080;
      const margin = document.body.classList.contains('show-notes') ? 260 : 0;
      const sx = vw / slideWidth;
      const sy = (vh - margin) / slideHeight;
      const scale = Math.min(sx, sy) * (document.body.classList.contains('show-notes') ? 0.94 : 1);
      slide.style.setProperty('--scale', scale.toFixed(3));
    } else {
      slides[idx].scrollIntoView({behavior:'smooth', block:'start'});
    }
  }

  function togglePresent(){
    document.body.classList.toggle('present');
    if(document.body.classList.contains('present')){
      activate(idx);
    } else {
      slides.forEach(slide => slide.style.removeProperty('--scale'));
    }
  }

  function toggleNotes(){
    document.body.classList.toggle('show-notes');
    activate(idx);
  }

  document.getElementById('btnPresent')?.addEventListener('click', togglePresent);
  document.getElementById('btnNotes')?.addEventListener('click', toggleNotes);
  document.getElementById('btnPrint')?.addEventListener('click', () => window.print());

  document.addEventListener('keydown', (event) => {
    if(event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
    switch(event.key){
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        event.preventDefault();
        activate(idx + 1);
        break;
      case 'ArrowLeft':
      case 'PageUp':
        event.preventDefault();
        activate(idx - 1);
        break;
      case 'Home':
        event.preventDefault();
        activate(0);
        break;
      case 'End':
        event.preventDefault();
        activate(total - 1);
        break;
      case 'p':
      case 'P':
        togglePresent();
        break;
      case 'n':
      case 'N':
        toggleNotes();
        break;
      case 'Escape':
        if(document.body.classList.contains('present')) togglePresent();
        break;
    }
  });

  window.addEventListener('resize', () => {
    if(document.body.classList.contains('present')) activate(idx);
  });

  deck?.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if(anchor){
      const target = document.getElementById(anchor.getAttribute('href').slice(1));
      if(target?.classList.contains('slide')){
        event.preventDefault();
        const targetIndex = slides.indexOf(target);
        if(targetIndex >= 0){
          activate(targetIndex);
          history.replaceState(null, '', anchor.getAttribute('href'));
        }
        return;
      }
    }

    if(!document.body.classList.contains('present')) return;
    if(event.target.closest('.toolbar') || event.target.closest('.helpbar')) return;
    activate(idx + 1);
  });

  syncProgress();
  activate(0);
})();