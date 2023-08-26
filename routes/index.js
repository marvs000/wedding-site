const express = require('express');
const router = express.Router();
const Attendees = require('../models/Attendees');
const Rsvp = require('../models/Rsvp');
const Responses = require('../models/Responses');
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

router.get('/responses', (req, res) => {
    Responses.findAll({
        attributes: ['complete_name', 'confirmed', 'rsvp_date']
    }).then(responses => {
        // Convert the responses array to a format suitable for rendering in HTML
        const tableRows = responses.map((response, index) => `
            <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td>${response.complete_name}</td>
                <td style="text-align: center;">${response.confirmed}</td>
                <td style="text-align: center;">${new Date(response.rsvp_date).toLocaleString()}</td>
            </tr>
        `);
        
        // Create the HTML table structure
        const tableHTML = `
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="/fonts/gotham/gotham-stylesheet.css" />
            <style>
                * {
                    font-family: gothambook;
                }
                .text-nowrap {
                    white-space: nowrap !important;
                }
                
                .table-responsive {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .card .table {
                    margin-bottom: 0;
                }
                .table {
                    --bs-table-bg: transparent;
                    --bs-table-accent-bg: transparent;
                    --bs-table-striped-color: #697a8d;
                    --bs-table-striped-bg: #f9fafb;
                    --bs-table-active-color: #697a8d;
                    --bs-table-active-bg: rgba(67, 89, 113, 0.1);
                    --bs-table-hover-color: #697a8d;
                    --bs-table-hover-bg: rgba(67, 89, 113, 0.06);
                    width: 100%;
                    margin-bottom: 1rem;
                    color: #697a8d;
                    vertical-align: middle;
                    border-color: #d9dee3;
                }
                table {
                    caption-side: bottom;
                    border-collapse: collapse;
                }

                thead, tbody, tfoot, tr, td, th {
                    border-color: inherit;
                    border-style: solid;
                    border-width: 0;
                }

                .table>thead {
                    vertical-align: bottom;
                }
                
                .table-light {
                    --bs-table-bg: #fcfdfd;
                    --bs-table-striped-bg: #f6f8f9;
                    --bs-table-striped-color: #435971;
                    --bs-table-active-bg: #eaedef;
                    --bs-table-active-color: #435971;
                    --bs-table-hover-bg: #f1f3f5;
                    --bs-table-hover-color: #435971;
                    color: #435971;
                    border-color: #eaedef;
                }
                .table-light {
                    --bs-table-bg: #fcfdfd;
                    --bs-table-striped-bg: #f6f8f9;
                    --bs-table-striped-color: #435971;
                    --bs-table-active-bg: #eaedef;
                    --bs-table-active-color: #435971;
                    --bs-table-hover-bg: #f1f3f5;
                    --bs-table-hover-color: #435971;
                    color: #435971;
                    border-color: #eaedef;
                }
                .table:not(.table-dark) th {
                    color: #566a7f;
                }
                .table th, td {
                    text-transform: uppercase;
                    font-size: .5rem;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }
                .table-light th {
                    border-bottom-color: inherit !important;
                }
                .table>:not(caption)>*>* {
                    padding: 0.625rem .6rem;
                    background-color: var(--bs-table-bg);
                    border-bottom-width: 1px;
                    box-shadow: inset 0 0 0 9999px var(--bs-table-accent-bg);
                }
                .table>:not(:first-child) {
                    border-top: 2px solid #d9dee3;
                }
                .table>tbody {
                    vertical-align: inherit;
                }
            </style>
            <div class="table-responsive text-nowrap">
                <table class="table">
                    <thead class="table-light">
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>RSVP</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody class="table-border-bottom-0">
                        ${tableRows.join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Send the HTML table structure as the response
        res.send(tableHTML);
    }).catch(err => res.send({ error: err.message }))
});

module.exports = router;