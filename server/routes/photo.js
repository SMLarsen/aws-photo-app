/*jshint esversion: 6 */
var express = require('express');
var router = express.Router();
var pg = require('pg');
var config = require('../modules/pg-config');

var pool = new pg.Pool(config.pg);

router.get("/:id", function(req, res) {
    let projectID = req.params.id;
    pool.connect()
        .then(function(client) {
            client.query('SELECT * FROM team WHERE team.project_id = $1', [projectID], function(err, result) {
                if (err) {
                    client.release();
                    console.log('Error getting team data', err);
                    res.sendStatus(500);
                } else {
                    client.release();
                    res.send(result.rows);
                }
            });
        });
});

router.get("/members/:id", function(req, res) {
    let projectID = req.params.id;
    pool.connect()
        .then(function(client) {
            client.query('SELECT project_id, team_size, team.name AS team_name, team_member.id AS member_id, team_id, person_id, cohort_id, person.name AS person_name FROM team JOIN team_member ON team.id = team_member.team_id JOIN person ON team_member.person_id = person.id WHERE team.project_id = $1 ORDER BY team_id', [projectID], function(err, result) {
                if (err) {
                    client.release();
                    console.log('Error getting team data', err);
                    res.sendStatus(500);
                } else {
                    client.release();
                    res.send(result.rows);
                }
            });
        });
});

module.exports = router;
router.post("/", function(req, res) {
    console.log('req.body:', req.body);
    pool.connect()
        .then((client) => {
            client.query('INSERT INTO team (project_id, team_size, name) VALUES ($1, $2, $3)', [req.body.project_id, req.body.team_size, req.body.name], function(err, result) {
                if (err) {
                    client.release();
                    console.log('Error inserting team', err);
                    res.sendStatus(500);
                } else {
                    client.release();
                    res.sendStatus(201);
                }
            });
        });
});

module.exports = router;
router.put("/", function(req, res) {
    console.log('req.body:', req.body);
    pool.connect()
        .then((client) => {
            client.query('UPDATE team SET project_id = $1, team_size = $2, name = $3 WHERE id = $4', [req.body.project_id, req.body.team_size, req.body.name, req.body.id], function(err, result) {
                if (err) {
                    client.release();
                    console.log('Error updating team', err);
                    res.sendStatus(500);
                } else {
                    client.release();
                    res.sendStatus(202);
                }
            });
        });
});

module.exports = router;
router.delete("/", function(req, res) {
    console.log('req.body:', req.body);
    pool.connect()
        .then((client) => {
            client.query('DELETE FROM team WHERE id = $1', [req.body.id], function(err, result) {
                if (err) {
                    client.release();
                    console.log('Error deleting team', err);
                    res.sendStatus(500);
                } else {
                    client.release();
                    res.sendStatus(202);
                }
            });
        });
});

module.exports = router;