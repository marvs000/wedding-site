const express = require('express');
const router = express.Router();
const Attendees = require('../models/Attendees');
const Rsvp = require('../models/Rsvp');
const Companion = require('../models/Companion');
const Sequelize = require('../config/connection');

router.get('/', (req, res) => {
    Attendees.findAll({
        order:[[ 'lastname', 'ASC' ]]
    }).then(attendees => {
        res.render('index', { attendees: JSON.parse(JSON.stringify(attendees)) })
    }).catch(err => res.send({ error: err.message }))
});

router.post('/send-rsvp', async (req, res) => {
    let { complete_name, confirmed, suggestions } = req.body;
    console.log('req.body', req.body)

    const attendees_find = await Attendees.findAll({
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

    let attendees_info = JSON.parse(JSON.stringify(attendees_find));
    console.log('attendees_info', attendees_info)

    if (attendees_info.length > 0) {
        const rsvp_count = await Rsvp.count({
            where: { complete_name }
        });
        
        if (rsvp_count > 0) {
            try {
                await Rsvp.update({ confirmed }, {
                    where: { complete_name }
                });
                
                if (req.body['companion[]'] !== undefined) {
                    // Delete all companion of a guest
                    await Companion.destroy({ where: { parent_id: attendees_info[0].id } });

                    let compArr = typeof (req.body['companion[]']);
                    if ((typeof (req.body['companion[]'])) === 'string' ) {
                        compArr = [ req.body['companion[]'] ]
                    } else {
                        compArr = req.body['companion[]'];
                    }

                    // Add all companion of guest based on input
                    await Promise.all(compArr.map(async comp => {
                        await Companion.create({ parent_id: attendees_info[0].id, complete_name: comp });
                    }));
                } else {
                    // Delete all companion of a guest
                    await Companion.destroy({ where: { parent_id: attendees_info[0].id } });
                }

                res.send({ message: "RSVP successfully updated! 😍" });
            } catch(comp_error) {
                console.log('comp_error', comp_error)
            }
        } else {
            try {
                const rsvp = await Rsvp.create({ complete_name, confirmed, suggestions });
                
                if (req.body['companion[]'] !== undefined) {
                    await Promise.all(req.body['companion[]'].map(async comp => {
                        await Companion.create({ parent_id: attendees_info[0].id, complete_name: comp });
                    }));
                }

                res.send({ message: "RSVP successfully sent! 😍" });
            } catch(comp_error) {
                console.log('comp_error', comp_error)
            }
        }
    } else {
        res.status(500).send({ message: "Attendee was not found on the records!" });
    }
});

router.get('/attendee/has/companion', async (req, res) => {
    let complete_name  = req.query.complete_name;

    const attendees_find = await Attendees.findAll({
        where: Sequelize.where(
            Sequelize.fn(
                "concat",
                Sequelize.col("lastname"), ", ",
                Sequelize.col("firstname"), " ",
                Sequelize.col("mi"), "."
            ),
            complete_name
        )
    });

    let attendees_info = JSON.parse(JSON.stringify(attendees_find));
    console.log('attendees_info', attendees_info)

    if (attendees_info.length > 0) {
        res.send({
            message: (attendees_info[0].company === null || attendees_info[0].company === 0) ? false : true,
            data: { companion: attendees_info[0].company }
        });
    } else {
        res.status(500).send({ message: "Attendee was not found on the records!" });
    }
})

module.exports = router;