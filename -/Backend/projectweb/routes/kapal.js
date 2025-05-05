var express = require('express');
var router = express.Router();

var connection = require('../config/database.js');

router.get('/', function (req, res, next) {
    connection.query('SELECT kapal.*, pemilik.*,dpi.*, alat_tangkap.* FROM kapal JOIN pemilik ON kapal.id_pemilik = pemilik.id_pemilik JOIN dpi ON kapal.id_dpi = dpi.id_dpi JOIN alat_tangkap ON kapal.id_alat_tangkap = alat_tangkap.id_alat_tangkap', function (err, rows) {
        if (err) {
            req.flash('error', err);
        } else {
            res.render('kapal/index', {
                data: rows
            });
        }
    });
});

// router.get('/create', function (req, res, next) {
//     res.render('kapal/create');
// });

router.get('/create', function (req, res, next) {
    let queryPemilik = 'SELECT * FROM pemilik';
    let queryDpi = 'SELECT * FROM dpi';
    let queryAlat = 'SELECT * FROM alat_tangkap'; 

    connection.query(queryPemilik, function (err, rows) {
        if (err) {
            req.flash('error', 'Gagal mengambil data pemilik');
            return res.redirect('/kapal');
        }

        connection.query(queryDpi, function (err, dpiRows) {
            if (err) {
                req.flash('error', 'Gagal mengambil data dpi');
                return res.redirect('/kapal');
            }

            connection.query(queryAlat, function (err, alatRows) {
                if (err) {
                    req.flash('error', 'Gagal mengambil data Alat');
                    return res.redirect('/kapal');
                }

                res.render('kapal/create', {
                    data: rows,
                    dpi: dpiRows,
                    alat: alatRows
                    // id_pemilik: produkRows[0].id_pemilik,
                    // nama_pemilik: produkRows[0].nama_pemilik,
                });
            });
        });
    });
});

router.post("/store", function (req, res, next) {
    try {
        let { nama_kapal, id_pemilik, id_dpi, id_alat_tangkap } = req.body;
        let Data = {
            nama_kapal, id_pemilik, id_dpi, id_alat_tangkap
        }
        connection.query('insert into kapal set ?', Data, function (err, result) {
            if (err) {
                req.flash('error', 'gagal menyimpan data' + err.message);
            } else {
                req.flash('success', 'berhasil menyimpan data');
            }
            res.redirect('/kapal');
        })
    } catch (error) {
        req.flash('error', 'Terjadi Kesalahan pada fungsi');
        res.redirect('/kapal');
    }
});


// Route edit
router.get('/edit/:id', function (req, res, next) {
    let id = req.params.id;

    let getKapal = 'SELECT * FROM kapal WHERE id_kapal = ?';
    let getPemilik = 'SELECT * FROM pemilik';
    let getDpi = 'SELECT * FROM dpi';
    let getAlat = 'SELECT * FROM alat_tangkap';

    connection.query(getKapal, [id], function (err, kapalRows) {
        if (err || kapalRows.length === 0) {
            req.flash('error', 'Data kapal tidak ditemukan');
            return res.redirect('/kapal');
        }

        let kapal = kapalRows[0];

        connection.query(getPemilik, function (err, pemilikRows) {
            if (err) return res.redirect('/kapal');

            connection.query(getDpi, function (err, dpiRows) {
                if (err) return res.redirect('/kapal');

                connection.query(getAlat, function (err, alatRows) {
                    if (err) return res.redirect('/kapal');

                    res.render('kapal/edit', {
                        kapal: kapal,
                        pemilik: pemilikRows,
                        dpi: dpiRows,
                        alat: alatRows,
                        id_pemilik: kapal.id_pemilik,
                        id_dpi: kapal.id_dpi,
                        id_alat_tangkap: kapal.id_alat_tangkap
                    });
                });
            });
        });
    });
});

// Route update
router.post('/update/:id', function (req, res, next) {
    let id = req.params.id;
    let { nama_kapal, id_pemilik, id_dpi, id_alat_tangkap } = req.body;

    let dataUpdate = {
        nama_kapal,
        id_pemilik,
        id_dpi,
        id_alat_tangkap
    };

    connection.query('UPDATE kapal SET ? WHERE id_kapal = ?', [dataUpdate, id], function (err, result) {
        if (err) {
            req.flash('error', 'Gagal update data: ' + err.message);
        } else {
            req.flash('success', 'Berhasil update data');
        }
        res.redirect('/kapal');
    });
});



router.get('/delete/(:id)', function (req, res, next) {
    let id = req.params.id;
    connection.query('delete from kapal where id_kapal = ' + id, function (err) {
        if (err) {
            req.flash('eror', 'gagal query');
        } else {
            req.flash('success', 'Data deleted successfully');
        }
        res.redirect('/kapal');
    })
});

module.exports = router;
