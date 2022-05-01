const axios = require('axios');
const cheerio = require('cheerio');
const headers = require('./config/header');
const {
    CafeDaManha
} = require('./models/cardapio');
const {
    Dia
} = require('./models/dia');

const BASE_URL = "https://pra.ufpr.br/ru/ru-central/";

const getPage = () => {
    const url = `${BASE_URL}`;

    const options = {
        headers: headers
    };

    return axios.get(url, options).then((response) => response.data)
}

const getPageItens = (html) => {
    const $ = cheerio.load(html);

    const promiseCallback = (resolve, reject) => {
        const days = [];
        const itens = [];

        const selectorDays = "#post > div > p > strong";
        $(selectorDays).each(function (idx, el) {
            days.push($(el).text());
        });

        const selectorItens = "#post > div > figure > table > tbody > tr > td";
        $(selectorItens).each(function (idx, el) {
            const text = $(el).text().trim().replace(/\s\s+/g, '|');
            if (idx % 2 == 0) {
                itens.push(text);
            } else {
                itens[itens.length - 1] = `${itens[itens.length - 1]}:${text}`
            }
        });
        formatData(days, itens)
        resolve(true);
    }

    return new Promise(promiseCallback)
}

const formatData = (days, cardapioItens) => {
    const dayRegex = new RegExp('[0-9]{2}[/][0-9]{2}[/][0-9]{4}');

    days = days.filter(d => (dayRegex.test(d)))
        .map(day => {
            const d = day.split(':');
            return {
                dataLitaral: d[0],
                data: d[1].trim()
            }
        });
        console.log(cardapioItens.length);

    

    cardapioItens.foreach((item, index) => { 
        if(index % 2 == 1) {
            const itens = item.split("|");
            const nome = cardapioItens[index - 1];
            const principal = itens[0];

            if(index - 1 == 0) {
                const acompanhamento = itens[1];
                new CafeDaManha(nome, principal, acompanhamento);
            } else {
                const vegano = itens.find(i => i.includes('Vegano'));
                const salada = itens.find(i => i.includes('Saladas'));

            }

        }
     })
}

getPage().then(getPageItens).catch(console.error);