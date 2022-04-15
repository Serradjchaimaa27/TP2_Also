const express = require('express');
const app = express();
const surahs = require('./surahs.json');
const { body, validationResult } = require('express-validator');


app.use(express.json());
app.use(logErrors);
app.use(surahsErrorHandler);
app.use(errorHandler);
app.get('/', (req, res) => {
    res.send("<h1> Bienvenu à notre API Quran </h1>")
});
// afficher tous les surahs
app.get('/surahs', (req, res) => {
    res.status(200).json(surahs)
});

//afficher  des surahs à l'aide du numéro du surah
app.get('/surahs/:number', (req, res) => {
    const number = parseInt(req.params.number)
    const surah = surahs.find(surah => surah.number === number)
    if (!surah) return res.json({ message: "n'existe pas !" })
    res.status(200).json(surah)
});
// créer un surah
app.post('/surahs',
    ///Sanitization
    body('number').isInt(),
    body('name').not().isEmpty().trim().escape(),
    body('englishName').not().trim().escape(),
    body('englishNameTranslation').not().trim().escape(),
    body('numberOfAyahs').isInt(),
    body('revelationType').not().trim().escape(),
    (req, res) => {
        let surah = req.body;
        const errors = validationResult(req);
        // le test 
        if (!surah.number && !surah.name) {
            return res.status(400).json("surah n'est pas crée");

        }
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        res.status(200).json({
            success: true,
            message: 'crée avec succée',

        })
    });
// mise à jour d'un surah
app.put('/surahs/:number', (req, res) => {
    const number = parseInt(req.params.number)
    let surah = surahs.find(surah => surah.number === number)
    surah.name = req.body.name,
        surah.englishName = req.body.englishName,
        surah.englishNameTranslation = req.body.englishNameTranslation,
        surah.numberOfAyahs = parseInt(req.params.numberOfAyahs),
        surah.revelationType = req.body.revelationType,
        res.status(200).json(surah)
    res.send('surah ${surah.name} etait ajouté à notre base de donnée. ')
});
//Supprimer surah
app.delete('/surahs/:number', (req, res) => {
    const number = parseInt(req.params.number)
    let surah = surahs.find(surahs => surah.number === number)
    surahs.splice(surahs.indexOf(surah), 1)
    res.status(200).json(surahs)
    res.send('surah ${number} etait supprimé. ')
});
// error handler
function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}
function surahsErrorHandler(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: 'Quelque chose a échoué!' });
    } else {
        next(err);
    }
}
function errorHandler(err, req, res, next) {
    res.status(500);
    res.render('erreur', { error: err });
}

app.listen(8080, () => {
    console.log("Serveur à l'écoute sur :http://localhost:8080")
});