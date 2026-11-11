/* =========================================================
   POKÉDEX - CONSULTA E EXIBIÇÃO DOS POKÉMONS
   Este arquivo controla o teclado numérico, a pesquisa na
   PokeAPI, os visores e os botões direcionais (D-pad).
   JavaScript Vanilla: sem bibliotecas ou frameworks.
   ========================================================= */

/* A Pokédex Nacional da PokeAPI possui Pokémon numerados de
   1 até 1025. Se a API ampliar a lista, este é o valor a alterar. */
const MAX_POKEMON_ID = 1025;

let estadoPokedex = {
    digitando: false
};

let numPokemon = '';
let pokemonAtual = null;

/* ---------------------------------------------------------
   1. ELEMENTOS HTML UTILIZADOS
   --------------------------------------------------------- */

// Teclado numérico
const key1 = document.querySelector('#key-1');
const key2 = document.querySelector('#key-2');
const key3 = document.querySelector('#key-3');
const key4 = document.querySelector('#key-4');
const key5 = document.querySelector('#key-5');
const key6 = document.querySelector('#key-6');
const key7 = document.querySelector('#key-7');
const key8 = document.querySelector('#key-8');
const key9 = document.querySelector('#key-9');
const key10 = document.querySelector('#key-10');

// Botões SEARCH e DELETE
const btnWhiteLeft = document.querySelector('#btn-white-left');
const btnWhiteRight = document.querySelector('#btn-white-right');

// Visores
const infoScreen = document.querySelector('#info-screen');
const mainScreen = document.querySelector('#main-screen');
const numberDisplay = document.querySelector('#number-display');

// Telinhas inferiores: ficam inicialmente como estão no HTML (---).
const smallDisplayLeft = document.querySelector('#small-display-left');
const smallDisplayRight = document.querySelector('#small-display-right');

// Botões direcionais
const btnUp = document.querySelector('#btn-up');
const btnDown = document.querySelector('#btn-down');
const btnLeft = document.querySelector('#btn-left');
const btnRight = document.querySelector('#btn-right');

/* ---------------------------------------------------------
   2. EVENTOS DOS BOTÕES
   --------------------------------------------------------- */

// Cada tecla envia seu algarismo para a função leituraTeclado.
key1.addEventListener('click', () => leituraTeclado('1'));
key2.addEventListener('click', () => leituraTeclado('2'));
key3.addEventListener('click', () => leituraTeclado('3'));
key4.addEventListener('click', () => leituraTeclado('4'));
key5.addEventListener('click', () => leituraTeclado('5'));
key6.addEventListener('click', () => leituraTeclado('6'));
key7.addEventListener('click', () => leituraTeclado('7'));
key8.addEventListener('click', () => leituraTeclado('8'));
key9.addEventListener('click', () => leituraTeclado('9'));
key10.addEventListener('click', () => leituraTeclado('0'));

btnWhiteLeft.addEventListener('click', buscarPokemon);
btnWhiteRight.addEventListener('click', apagar);

// Setas laterais: alteram o ID em 1.
btnLeft.addEventListener('click', () => trocarPokemon(-1));
btnRight.addEventListener('click', () => trocarPokemon(1));

// Setas verticais: alteram o ID em 10.
btnUp.addEventListener('click', () => trocarPokemon(10));
btnDown.addEventListener('click', () => trocarPokemon(-10));

/* ---------------------------------------------------------
   3. TELINHAS INFERIORES
   --------------------------------------------------------- */

// Exibe qualquer texto na telinha inferior esquerda.
function exibirDisplayInferiorEsquerdo(informacao) {
    smallDisplayLeft.textContent = informacao;
}

// Exibe qualquer texto na telinha inferior direita.
function exibirDisplayInferiorDireito(informacao) {
    smallDisplayRight.textContent = informacao;
}

// Atualiza as duas telinhas de uma vez, se isso for conveniente.
function atualizarDisplaysInferiores(informacaoEsquerda, informacaoDireita) {
    exibirDisplayInferiorEsquerdo(informacaoEsquerda);
    exibirDisplayInferiorDireito(informacaoDireita);
}

// Restaura o marcador original de cada telinha.
function limparDisplayInferiorEsquerdo() {
    smallDisplayLeft.textContent = '---';
}

function limparDisplayInferiorDireito() {
    smallDisplayRight.textContent = '---';
}

function limparDisplaysInferiores() {
    limparDisplayInferiorEsquerdo();
    limparDisplayInferiorDireito();
}

/* ---------------------------------------------------------
   4. TECLADO NUMÉRICO
   --------------------------------------------------------- */

function leituraTeclado(tecla) {
    // Ao começar uma nova digitação, limpa o campo de pesquisa.
    if (!estadoPokedex.digitando) {
        numPokemon = '';
        infoScreen.textContent = '';
        estadoPokedex.digitando = true;
    }

    // O maior ID atual tem quatro algarismos.
    if (numPokemon.length < 4) {
        numPokemon += tecla;
        infoScreen.textContent = numPokemon;
    }
}

function apagar() {
    if (estadoPokedex.digitando) {
        numPokemon = numPokemon.slice(0, -1);

        if (numPokemon.length === 0) {
            estadoPokedex.digitando = false;
            infoScreen.textContent = 'Aguardando dados…';
        } else {
            infoScreen.textContent = numPokemon;
        }
    }
}

/* ---------------------------------------------------------
   5. PESQUISAR UM POKÉMON NA POKEAPI
   --------------------------------------------------------- */

async function buscarPokemon() {
    if (!estadoPokedex.digitando || numPokemon.length === 0) {
        return;
    }

    const id = Number(numPokemon);

    // Encerra a digitação antes de iniciar a consulta.
    estadoPokedex.digitando = false;
    numPokemon = '';

    await consultarApi(id);
}

async function consultarApi(id) {
    // Impede consultas com IDs que não pertencem à Pokédex Nacional.
    if (!Number.isInteger(id) || id < 1 || id > MAX_POKEMON_ID) {
        mostrarErro();
        return;
    }

    try {
        // Busca os dados principais do Pokémon.
        const respostaPokemon = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${id}`
        );

        // A PokeAPI responde com status diferente de OK para IDs inexistentes.
        if (!respostaPokemon.ok) {
            throw new Error('Pokémon não encontrado.');
        }

        const data = await respostaPokemon.json();

        // Busca a espécie para descobrir a geração e a região de origem.
        const respostaEspecie = await fetch(data.species.url);

        if (!respostaEspecie.ok) {
            throw new Error('Não foi possível consultar a região.');
        }

        const especie = await respostaEspecie.json();

        // Guarda o ID selecionado para que o D-pad possa utilizá-lo.
        pokemonAtual = data.id;

        // Atualiza todos os visores com os dados do mesmo Pokémon.
        atualizarNumero(data.id);
        exibirSprite(data.sprites.front_default);
        exibirDados(data, especie);

    } catch (erro) {
        console.error(erro);
        mostrarErro();
    }
}

/* ---------------------------------------------------------
   6. TRATAMENTO DE ERROS
   --------------------------------------------------------- */

function mostrarErro(manterPokemon = false) {
    // A mensagem ERRO aparece no visor principal, não no visor do sprite.
    mainScreen.textContent = 'ERRO';

    // Informa o motivo no visor de informações.
    infoScreen.textContent = manterPokemon
        ? 'Limite da Pokédex atingido.'
        : 'Pokémon não encontrado.';

    // Em uma pesquisa inválida, limpa também o número selecionado.
    // No limite do D-pad, mantém o ID para permitir voltar ou avançar.
    if (!manterPokemon) {
        numberDisplay.textContent = '#----';
        pokemonAtual = null;
    }
}

/* ---------------------------------------------------------
   7. EXIBIR A IMAGEM DO POKÉMON
   --------------------------------------------------------- */

function exibirSprite(urlImage) {
    mainScreen.textContent = '';

    // Alguns registros podem não possuir sprite frontal.
    if (!urlImage) {
        mainScreen.textContent = 'Imagem indisponível';
        return;
    }

    const img = document.createElement('img');
    img.src = urlImage;
    img.alt = 'Sprite frontal do Pokémon';

    if (window.innerWidth < 600) {
        img.style.width = '75px';
    } else {
        img.style.width = '190px';
        img.style.transform = 'translate(0, -12px)';
    }

    mainScreen.appendChild(img);
}

/* ---------------------------------------------------------
   8. ATUALIZAR O NÚMERO DO POKÉMON
   --------------------------------------------------------- */

function atualizarNumero(id) {
    let idString = id.toString();

    // Acrescenta zeros à esquerda até completar quatro algarismos.
    while (idString.length < 4) {
        idString = '0' + idString;
    }

    numberDisplay.textContent = '#' + idString;
}

/* ---------------------------------------------------------
   9. EXIBIR AS CARACTERÍSTICAS DO POKÉMON
   --------------------------------------------------------- */

function exibirDados(data, especie) {
    const nome = capitalizar(data.name);

    // Um Pokémon pode possuir mais de um tipo.
    const tipos = data.types
        .map(item => capitalizar(item.type.name))
        .join(' / ');

    // A PokeAPI fornece o peso em hectogramas.
    // 1 hectograma equivale a 100 gramas.
    const pesoEmKg = data.weight / 10;
    let pesoFormatado;

    if (pesoEmKg < 1) {
        pesoFormatado = formatarMedida(data.weight * 100) + ' g';
    } else {
        pesoFormatado = formatarMedida(pesoEmKg) + ' kg';
    }

    // A PokeAPI fornece a altura em decímetros.
    // 1 decímetro equivale a 10 centímetros.
    const alturaEmMetros = data.height / 10;
    let alturaFormatada;

    if (alturaEmMetros < 0.01) {
        alturaFormatada = formatarMedida(data.height * 100) + ' mm';
    } else if (alturaEmMetros < 1) {
        alturaFormatada = formatarMedida(data.height * 10) + ' cm';
    } else {
        alturaFormatada = formatarMedida(alturaEmMetros) + ' m';
    }

    const regiao = descobrirRegiao(especie.generation.name);

    // Cada informação ocupa uma linha do visor de informações.
    infoScreen.textContent =
        nome +
        '\nTipo: ' + tipos +
        '\nPeso: ' + pesoFormatado +
        '\nAltura: ' + alturaFormatada +
        '\nRegião: ' + regiao;
}

/* ---------------------------------------------------------
   9. DESCOBRIR A REGIÃO PELA GERAÇÃO
   --------------------------------------------------------- */

function descobrirRegiao(geracao) {
    const regioes = {
        'generation-i': 'Kanto',
        'generation-ii': 'Johto',
        'generation-iii': 'Hoenn',
        'generation-iv': 'Sinnoh',
        'generation-v': 'Unova',
        'generation-vi': 'Kalos',
        'generation-vii': 'Alola',
        'generation-viii': 'Galar',
        'generation-ix': 'Paldea'
    };

    return regioes[geracao] || 'Região não identificada';
}

/* ---------------------------------------------------------
   10. FORMATAÇÃO DE MEDIDAS
   --------------------------------------------------------- */

function formatarMedida(valor) {
    return valor.toLocaleString('pt-BR', {
        maximumFractionDigits: 2
    });
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/* ---------------------------------------------------------
   11. BOTÕES DIRECIONAIS (D-PAD)
   --------------------------------------------------------- */

function trocarPokemon(incremento) {
    // O D-pad só funciona depois que um Pokémon foi selecionado.
    if (pokemonAtual === null) {
        mostrarErro();
        return;
    }

    const novoId = pokemonAtual + incremento;

    // Não permite avançar para IDs menores que 1 ou maiores que 1025.
    if (novoId < 1 || novoId > MAX_POKEMON_ID) {
        mostrarErro(true);
        return;
    }

    // Consulta novamente a API: imagem e todas as características
    // serão atualizadas juntas com base no novo ID.
    consultarApi(novoId);
}
