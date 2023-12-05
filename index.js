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
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept'
}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const url = 'https://www.megaloterias.com.br/mega-sena/resultados';

const apiKey = process.env.API_KEY;
app.use((req, res, next) => {
    const userApiKey = req.headers['x-api-key'];

    if (!userApiKey || userApiKey !== apiKey) {
        return res.status(401).json({ error: 'Chave de API inválida' });
    }

    next();
});

app.get('/api/resultado/megasena', async (req, res) => {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const resultadoInfo = {
            tituloModalidade: $('div.result__title h2').text().trim(),
            concurso: Number($('div.result__draw strong').text().trim()),
            dataSorteio: $('div.result__draw-date strong').text().trim(),
            localSorteio: $('div.text-sm-left strong').text().trim(),
            valorPremiado: $('div.result__prize__wrap span.result__prize__value').text().trim(),
            numerosSorteados: $('div.lot-bg-light span').slice(0, 6).map(function() {
                return $(this).text().trim();
            }).get(),
            acumulado: (( $('p.text-uppercase strong').text().trim() === 'Acumulou!' )?true:false),
            premiacoes: $('table.result__table-prize tbody tr:not(:first-child)').map(function() {
                const premiacao = {
                    categoria: $(this).find('td:nth-child(1)').text().trim(),
                    ganhadores: $(this).find('td:nth-child(2)').text().trim(),
                    premio: $(this).find('td:nth-child(3)').text().trim(),
                };
                return premiacao;
            }).get(),
            dataProxConcurso: $('.banner-nextdraw__draw-date strong').text().trim(),
            ProxConcurso: Number($('.banner-nextdraw__draw strong').text().trim()),
            valorEstimadoProxConcurso: $('.banner-nextdraw__prize__wrap').text().trim()
        };

        res.json(resultadoInfo);
    } catch (error) {
        console.error('Erro ao fazer a requisição:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.get('/api/resultado/duplasena', async (req, res) => {
    try {
        const response = await axios.get('https://www.megaloterias.com.br/dupla-sena/resultados');
        const html = response.data;
        const $ = cheerio.load(html);

        const resultadoInfo = {
            tituloModalidade: $('div.result__title h2').text().trim(),
            concurso: Number($('div.result__draw strong').text().trim()),
            dataSorteio: $('div.result__draw-date strong').text().trim(),
            localSorteio: $('div.text-sm-left strong').text().trim(),
            valorPremiado: $('div.result__prize__wrap span.result__prize__value').text().trim(),
            primeiroSorteio: {
                numerosSorteados: $('div.lot-bg-light span').slice(0, 6).map(function() {
                    return $(this).text().trim();
                }).get()
            },
            segundoSorteio: {
                numerosSorteados: $('div.result__tens-grid div.lot-bg-light span').slice(6, 12).map(function() {
                    return $(this).text().trim();
                }).get()
            },
            acumulado: (( $('p.text-uppercase strong').text().trim() === 'Acumulou!' )?true:false),
            premiacaoPrimeiroSorteio: {
                premiacoes: $('table.result__table-prize tbody tr:not(:first-child)').slice(0, 4).map(function() {
                    const premiacao = {
                        categoria: $(this).find('td:nth-child(1)').text().trim(),
                        ganhadores: $(this).find('td:nth-child(2)').text().trim(),
                        premio: $(this).find('td:nth-child(3)').text().trim(),
                    };
                    return premiacao;
                }).get(),
            },
            premiacaoSegundoSorteio: {
                premiacoes: $('table.result__table-prize tbody tr:not(:first-child)').slice(4, 8).map(function() {
                    const premiacao = {
                        categoria: $(this).find('td:nth-child(1)').text().trim(),
                        ganhadores: $(this).find('td:nth-child(2)').text().trim(),
                        premio: $(this).find('td:nth-child(3)').text().trim(),
                    };
                    return premiacao;
                }).get(),
            },
            dataProxConcurso: $('.banner-nextdraw__draw-date strong').text().trim(),
            ProxConcurso: Number($('.banner-nextdraw__draw strong').text().trim()),
            valorEstimadoProxConcurso: $('.banner-nextdraw__prize__wrap').text().trim()
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