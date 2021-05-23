const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const path = require('path');
app.use(express.static('public'));

const fs = require('fs');
const mariadb = require('mariadb');
const dbConfig = JSON.parse(fs.readFileSync('shortener_config.json'));
const crypto = require('crypto');

const pool = mariadb.createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database
});

const PORT = dbConfig.server_port; // PORT where express will run

// ************************************************** //
// ********************* FUNCTIONS ****************** //
// ************************************************** //

const isValidUrl = (string) => {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(string);
};

// ************************************************** //
// *************** ROUTE ENDPOINTS ****************** //
// ************************************************** //

pool.getConnection()
    .then(conn => {
        function getURL (hash) {
            return conn.query({
                rowsAsArray: true,
                sql: 'SELECT url FROM shortener_urls WHERE hash = ?'
            }, [hash]);
        }

        function checkURL (url) {
            return conn.query({
                rowsAsArray: true,
                sql: 'SELECT hash FROM shortener_urls WHERE url = ?'
            }, [url]);
        }

        app.get('/shorten', function (req, res, next) {
            res.sendFile(path.join(__dirname + '/shorten.html'));
        });

        app.get('/shorten/:hash', function (req, res) {
            const hash = req.params.hash;
            let url;
            getURL(hash)
                .then((data) => {
                    if (data[0]) {
                        url = data[0][0];
                    }

                    if (url) res.status(301).redirect(url);
                    else res.status(401, 'Hash not found');
                });
        });

        app.post('/newurl', function (req, res, next) {
            const url = req.body.url;
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            let hash;
            if (isValidUrl(url)) {
                checkURL(url)
                    .then((data) => {
                        if (data[0]) {
                            hash = data[0][0];
                        }

                        if (hash) res.status(200).send(hash);
                        else {
                            hash = crypto.createHash('sha256').update(url + (+new Date())).digest('hex').substring(0, 9);

                            conn.query({
                                rowsAsArray: true,
                                sql: 'INSERT INTO shortener_urls (hash, url, ip) VALUES (?, ?, ?);'
                            }, [hash, url, ip])
                                .then(() => {
                                    res.status(200).send(hash);
                                });
                        }
                    });
            } else {
                res.status(200).send('lmao'); // Return lmao for an attempt of sending a "fake" URL
            }
        });

        app.listen(PORT, function () {
            console.log('Server is running..');
        });

        setInterval(function () {
            conn.query('SELECT 1'); // conn keep-alive
        }, 60000);
    });
