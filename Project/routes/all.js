var express = require('express');
var router = express.Router();
const db = require('../config/db');
/* GET users listing. */
router.get('/', function (req, res, next) {
    db.query('SELECT * FROM v_all_campaigns', function (err, rows) {
        if (err) {
            req.flash('error', err);
            res.render('all_campaign', {
                data: [],
                message: 'Terjadi kesalahan saat mengambil data.'
            });
        } else {
            if (rows.length === 0) {
                res.render('all_campaign', {
                    data: [],
                    message: 'Belum ada Campaign.'
                });
            } else {
                res.render('all_campaign', {
                    data: rows,
                    message: null
                });
            }
        }
    });
});

router.get('/detail/(:id)', function (req, res, next) {
    const id = req.params.id;
    const sql = 'SELECT * FROM v_all_campaigns WHERE id_campaign = ?';
    const sql1 = 'SELECT * FROM v_donatur_count_per_campaign WHERE id_campaign = ?';
    const sql2 = 'SELECT * FROM v_nama_donatur_per_campaign WHERE id_campaign = ? LIMIT 7';

    db.query(sql, [id], function (err, campaignRows) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/');
        }

        db.query(sql1, [id], function (err1, donaturCountRows) {
            if (err1) {
                req.flash('error', err1);
                return res.redirect('/');
            }

            db.query(sql2, [id], function (err2, donaturNamesRows) {
                if (err2) {
                    req.flash('error', err2);
                    return res.redirect('/');
                }

                res.render('detail_campaign', {
                    rows: campaignRows[0],
                    donaturCount: donaturCountRows[0] ? donaturCountRows[0].jumlah_donatur : 0,
                    name_donatur: donaturNamesRows,
                });
            });
        });
    });
});

router.get('/donasi/(:id)', function (req, res, next) {
    const id = req.params.id;
    res.render('donasi', {id});
})

module.exports = router;    