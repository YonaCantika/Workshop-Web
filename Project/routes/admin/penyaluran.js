var express = require('express');
var router = express.Router();
const db = require('../../config/db');
/* GET users listing. */
router.get('/', function (req, res, next) {
    db.query('select * from penyaluran', function (err, rows) {
        if (err) {
            req.flash('error', err);
        } else {
            res.render('admin/penyaluran/index', {
                data: rows
            });
        }
    });
});

module.exports = router;