require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

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

app.get('/api/proximo/megasena', async (req, res) => {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                maxRedirects: 5,
                withCredentials: true
            }
        });
        const $ = cheerio.load(response.data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const resultadoInfo = {
            acumulado: (( $('div.banner-nextdraw__is-jackpot').text().trim() === 'Acumulada!' )?true:false),
            tituloModalidade: 'Mega-Sena',
            numeroProxConcurso: Number($('div.banner-nextdraw__draw strong').text().trim()),
            dataProxSorteio: (( $('div.banner-nextdraw__draw-date').text().trim() === 'Sorteio:Hoje' )?'Sorteio Hoje':$('div.banner-nextdraw__draw-date').text().trim()),
            estimativaPremio: $('div.banner-nextdraw__prize__wrap').text().trim(),
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