const express = require('express');
const router = express.Router();
const Attendees = require('../models/Attendees');

router.get('/', (req, res) => {
    Attendees.findAll().then(attendees => {
        res.render('index', { attendees: JSON.parse(JSON.stringify(attendees)) })
    }).catch(err => res.send({ error: err.message }))
});

module.exports = router;