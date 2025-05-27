var express = require('express');
var router = express.Router();
const db = require('../config/db');
/* GET users listing. */
router.get('/', function (req, res, next) {
    db.query('select * from v_all_campaigns', function (err, rows) {
        if (err) {
            req.flash('error', err);
        } else {
            res.render('all_campaign', {
                data: rows
            });
        }
    });
});

module.exports = router;