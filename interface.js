/* =========================================================
   POKÉDEX - INTERFACE
   Controla apenas o comportamento da tela:
   abrir/fechar a Pokédex, zoom com o scroll do mouse e janela de ajuda.
   O código da PokeAPI fica no arquivo pokedex.js.
   ========================================================= */


/* ---------------------------------------------------------
   1. ABRIR E FECHAR A POKÉDEX
   --------------------------------------------------------- */
const pokedex = document.getElementById('pokedex');
const coverFront = document.getElementById('cover-front');
const lens = document.getElementById('lens');
const hint = document.getElementById('hint');

function setPokedexOpen(isOpen) {
  pokedex.classList.toggle('is-open', isOpen);
  coverFront.setAttribute('aria-expanded', isOpen);

  // Só o elemento visível pode receber foco pelo teclado
  coverFront.tabIndex = isOpen ? -1 : 0;
  lens.tabIndex = isOpen ? 0 : -1;

  hint.textContent = isOpen
    ? 'Clique na lente azul para fechar a Pokédex'
    : 'Clique na Pokédex acima para abri-la';
}

coverFront.addEventListener('click', () => setPokedexOpen(true));

lens.addEventListener('click', () => {
  if (pokedex.classList.contains('is-open')) {
    setPokedexOpen(false);
  }
});

// Permite abrir/fechar com Enter ou Espaço
[coverFront, lens].forEach((element) => {
  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      element.click();
    }
  });
});


/* ---------------------------------------------------------
   2. ZOOM COM A RODINHA DO MOUSE
   Altera a variável CSS --zoom; todas as medidas acompanham.
   --------------------------------------------------------- */
const stage = document.querySelector('.stage');
let zoom = 1;

// Maior zoom possível sem a Pokédex aberta sair da tela
function getMaxZoom() {
  const baseUnit = Math.min(innerWidth * .42, innerHeight * .30, 280);   // mesmo cálculo do CSS
  const fitUnit = Math.min(innerWidth * .95 / 2, innerHeight * .75 / 1.6);
  return Math.max(1, fitUnit / baseUnit);
}

function setZoom(value) {
  zoom = Math.min(Math.max(value, .5), getMaxZoom());
  document.documentElement.style.setProperty('--zoom', zoom);
}

stage.addEventListener('wheel', (event) => {
  if (event.ctrlKey) return;   // Ctrl + rodinha continua sendo o zoom do navegador
  event.preventDefault();      // evita rolar a página enquanto dá zoom
  setZoom(zoom * Math.exp(-event.deltaY * .0015));
}, { passive: false });

addEventListener('resize', () => setZoom(zoom));


/* ---------------------------------------------------------
   3. JANELA DE AJUDA
   --------------------------------------------------------- */
const helpDialog = document.getElementById('help-dialog');

document.getElementById('help-btn').addEventListener('click', () => helpDialog.showModal());
document.getElementById('help-close').addEventListener('click', () => helpDialog.close());
