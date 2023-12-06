require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());

const allowedOrigins = '*';
app.use(cors({
    origin: allowedOrigins,
    methods: 'GET',
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'x-api-key'], // Include 'x-api-key' in allowedHeaders
}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const url = 'https://www.megaloterias.com.br/resultados';

// const apiKey = process.env.API_KEY;
// app.use((req, res, next) => {
//     const userApiKey = req.headers['x-api-key'];

//     if (!userApiKey || userApiKey !== apiKey) {
//         return res.status(401).json({ error: 'Chave de API inválida' });
//     }

//     next();
// });

app.get('/api/resultados', async (req, res) => {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const resultadoInfo = {
            megasena: {
                tituloModalidade: $('section.lot-mega-sena header.lottery-totem__header div.lottery-totem__header-grid div.lottery-totem__header-grid__result div.result__title h2').text().trim(),
                dataSorteio: $('section.lot-mega-sena header.lottery-totem__header div.lottery-totem__header-grid div.lottery-totem__header-grid__result div.result__draw-date strong').text().trim(),
                concurso: Number($('section.lot-mega-sena header.lottery-totem__header div.lottery-totem__header-grid div.lottery-totem__header-grid__result div.result__draw strong').text().trim()),
                localDoSorteio: $('section.lot-mega-sena header.lottery-totem__header div.lottery-totem__header-grid div.lottery-totem__header-grid__result div.result__local div strong').text().trim(),
                valorSorteado: $('section.lot-mega-sena header.lottery-totem__header div.lottery-totem__header-grid div.lottery-totem__header-grid__result div.result__prize div.result__prize__wrap').text().trim(),
                dezenasSorteadas: $('section.lot-mega-sena div.lottery-totem__modules-grid div.lottery-totem__body div.lottery-totem__body__content div.result__content__wrap div.result__tens-grid div.lot-bg-light span').text().trim().match(/.{2}/g).map(function (dezena) { return parseInt(dezena, 10) }),
                acumulada: (( $('section.lot-mega-sena div.lottery-totem__modules-grid div.lottery-totem__body div.lottery-totem__body__content div.result__content__wrap p strong').text().trim() === 'Acumulou!' )?true:false),
                premiacoes: $('section.lot-mega-sena div.lottery-totem__modules-grid div.lottery-totem__body div.lottery-totem__body__content table.result__table-prize tbody tr:not(:first-child)').map(function() {
                    const premiacao = {
                        categoria: $(this).find('td:nth-child(1)').text().trim(),
                        ganhadores: $(this).find('td:nth-child(2)').text().trim(),
                        premio: $(this).find('td:nth-child(3)').text().trim(),
                    };
                    return premiacao;
                }).get(),
                proxConcurso: Number($('section.lot-mega-sena div.lottery-totem__modules-grid div.lottery-totem__aside div.lottery-totem__aside__wrap div.lottery-totem__nextdraw div.card div.lottery-totem__nextdraw__block div.lottery-totem__nextdraw__info div.lottery-totem__nextdraw__draw strong').text().trim()),
                dataProxSorteio: $('section.lot-mega-sena div.lottery-totem__modules-grid div.lottery-totem__aside div.lottery-totem__aside__wrap div.lottery-totem__nextdraw div.card div.lottery-totem__nextdraw__block div.lottery-totem__nextdraw__info div.lottery-totem__nextdraw__draw-date strong').text().trim(),
                acumuladaProxSorteio: (( $('section.lot-mega-sena div.lottery-totem__modules-grid div.lottery-totem__aside div.lottery-totem__aside__wrap div.lottery-totem__nextdraw div.card div.lottery-totem__nextdraw__block div.lottery-totem__nextdraw__info div.lottery-totem__nextdraw__is-jackpot span').text().trim() === 'Acumulada!' )?true:false),
                valorEstimadoProxConcurso: $('section.lot-mega-sena div.lottery-totem__modules-grid div.lottery-totem__aside div.lottery-totem__aside__wrap div.lottery-totem__nextdraw div.card div.lottery-totem__nextdraw__block div.lottery-totem__nextdraw__info div.lottery-totem__nextdraw__prize div.lottery-totem__nextdraw__prize__wrap').text().trim(),
            },
            duplasena: {
                tituloModalidade: $('section.lot-dupla-sena header.lottery-totem__header div.lottery-totem__header-grid div.lottery-totem__header-grid__result div.result__title h2').text().trim(),
            },
            lotofacil: {
                tituloModalidade: $('section.lot-lotofacil header.lottery-totem__header div.lottery-totem__header-grid div.lottery-totem__header-grid__result div.result__title h2').text().trim(),
            },
            quina: {
                tituloModalidade: $('section.lot-quina header.lottery-totem__header div.lottery-totem__header-grid div.lottery-totem__header-grid__result div.result__title h2').text().trim(),
            },
            timemania: {
                tituloModalidade: $('section.lot-timemania header.lottery-totem__header div.lottery-totem__header-grid div.lottery-totem__header-grid__result div.result__title h2').text().trim(),
            },
            lotomania: {
                tituloModalidade: $('section.lot-lotomania header.lottery-totem__header div.lottery-totem__header-grid div.lottery-totem__header-grid__result div.result__title h2').text().trim(),
            },
            diaDeSorte: {
                tituloModalidade: $('section.lot-dia-de-sorte header.lottery-totem__header div.lottery-totem__header-grid div.lottery-totem__header-grid__result div.result__title h2').text().trim(),
            },
            superSete: {
                tituloModalidade: $('section.lot-super-sete header.lottery-totem__header div.lottery-totem__header-grid div.lottery-totem__header-grid__result div.result__title h2').text().trim(),
            },
            maisMilionaria: {
                tituloModalidade: $('section.lot-mais-milionaria header.lottery-totem__header div.lottery-totem__header-grid div.lottery-totem__header-grid__result div.result__title h2').text().trim(),
            }
        };

        res.json(resultadoInfo);
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor em execução em http://localhost:${port}/`);
});