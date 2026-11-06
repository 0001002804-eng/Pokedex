
let estadoPokedex = {
    digitando: false,
}

let numPokemon = '';

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
const btnWhiteLeft = document.querySelector('#btn-white-left');
const btnWhiteRight = document.querySelector('#btn-white-right');
const infoScreen = document.querySelector('#info-screen');
const mainScreen = document.querySelector('#main-screen');
const numberDisplay = document.querySelector('#number-display');

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

function leituraTeclado(tecla)
{
    if(!estadoPokedex.digitando)
    {
        infoScreen.textContent = '';
        estadoPokedex.digitando = true;
    }
    numPokemon += tecla;
    infoScreen.textContent = numPokemon;
}

function apagar()
{
    if(estadoPokedex.digitando)
    {
        numPokemon = numPokemon.slice(0, -1);
        if(numPokemon.length < 1)
        {
            estadoPokedex.digitando = false;
            infoScreen.textContent = 'Aguardando dados…';
        }
        else
        {
            infoScreen.textContent = numPokemon;
        }
    }
}

async function consultarApi(msg)
{
    try
    {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${msg}`);
        const data = await response.json();
        atualizarNumero(data.id);
        const urlImage = data.sprites.front_default;
        exibirSprite(urlImage);
        exibirDados(data);
    }
    catch(erro)
    {
        alert(erro.msg);  
    }
}

function buscarPokemon()
{
    if(estadoPokedex.digitando) consultarApi(numPokemon);
}

function exibirSprite(urlImage)
{
    mainScreen.textContent = '';
    const img = document.createElement('img');
    img.src = urlImage;
    //img.style.width = '150px';
    if (window.innerWidth < 600)
    {
        img.style.width = '75px';
    }
    else
    {
        img.style.width = '190px';
        img.style.transform = 'translate(0, -12px)';
    }
    mainScreen.appendChild(img);
}

function atualizarNumero(id)
{

    let idString = id.toString();
    while(idString.length < 4) idString = '0' + idString;
    idString = '#' + idString;
    numberDisplay.textContent = idString;

}

function exibirDados (data)
{
    infoScreen.textContent = '';
    const nome = document. createElement('p');
    nome.textContent = capitalizar(data.name);
    nome.style.fontSize = '1.5rem';
    nome.style.fontWeight = 'bold';
    const tipo = document.createElement('p');
    tipo.textContent = 'Tipo: ' + capitalizar(data.types[0].type.name);
    const pesoAltura = document.createElement('p');
    pesoAltura.textContent = 'Peso: ' + (data.weight / 2.205) + 'kg';
    pesoAltura.textContent += ' | Altura: ' + (data.height / 39.37) + 'm';
    
    infoScreen.append(nome, tipo, pesoAltura);
}