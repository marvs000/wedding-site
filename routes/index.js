const express = require('express');
const router = express.Router();
const Attendees = require('../models/Attendees');
const Rsvp = require('../models/Rsvp');
const Sequelize = require('../config/connection');

router.get('/', (req, res) => {
    Attendees.findAll().then(attendees => {
        res.render('index', { attendees: JSON.parse(JSON.stringify(attendees)) })
    }).catch(err => res.send({ error: err.message }))
});

router.post('/send-rsvp', async (req, res) => {
    let { complete_name, confirmed, suggestions } = req.body;

    const attendees_count = await Attendees.count({
        where: Sequelize.where(
            Sequelize.fn(
                "concat",
                Sequelize.col("lastname"), ", ",
                Sequelize.col("firstname"), " ",
                Sequelize.col("mi"), "."
            ),
            req.body.complete_name
        )
    });

    console.log(req.body.complete_name)

    if (attendees_count > 0) {
        const rsvp_count = await Rsvp.count({
            where: { complete_name }
        });
        
        if (rsvp_count > 0) {
            await Rsvp.update({ confirmed, suggestions }, {
                where: { complete_name }
            });

            res.send({ message: "RSVP successfully updated! 😍" });
        } else {
            const rsvp = await Rsvp.create({ complete_name, confirmed, suggestions });
            
            res.send({ message: "RSVP successfully sent! 😍" });
        }
    } else {
        res.status(500).send({ message: "Attendee was not found on the records!" });
    }
})

module.exports = router;