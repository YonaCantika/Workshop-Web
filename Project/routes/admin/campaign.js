var express = require('express');
var router = express.Router();
const db = require('../../config/db');
/* GET users listing. */
router.get('/', function (req, res, next) {
    db.query('select * from campaigns', function (err, rows) {
        if (err) {
            req.flash('error', err);
        } else {
            res.render('admin/campaign/index', {
                data: rows
            });
        }
    });
});

router.get('/create', function (req, res, next) {

            res.render('admin/campaign/create')
});

module.exports = router;