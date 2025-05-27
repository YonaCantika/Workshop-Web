var express = require('express');
var router = express.Router();
const db = require('../../config/db');

const campaignRouter = require('./campaign');
const penyaluranRouter = require('./penyaluran');

router.use('/campaign', campaignRouter);
router.use('/penyaluran', penyaluranRouter);

router.get('/', function (req, res, next) {
    db.query('select * from users', function (err, rows) {
        if (err) {
            req.flash('error', err);
        } else {
            res.render('admin/index', {
                data: rows
            });
        }
    });
});



module.exports = router;