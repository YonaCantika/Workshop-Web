var express = require('express');
var router = express.Router();

var connection = require('../config/database.js');

router.get('/', function (req, res, next) {
    connection.query('select * from dpi order by id_dpi desc', function (err, rows) {
        if (err) {
            req.flash('error', err);
        } else {
            res.render('dpi/index', {
                data: rows
            });
        }
    });
});

router.get('/create', function (req, res, next) {
    res.render('dpi/create');
});

router.post("/store", function (req, res, next) {
    try {
        let { nama_dpi, luas } = req.body;
        let Data = {
            nama_dpi, luas
        }
        connection.query('insert into dpi set ?', Data, function (err, result) {
            if (err) {
                req.flash('error', 'gagal menyimpan data' + err.message);
            } else {
                req.flash('success', 'berhasil menyimpan data');
            }
            res.redirect('/dpi');
        })
    } catch (error) {
        req.flash('error', 'Terjadi Kesalahan pada fungsi');
        res.redirect('/dpi');
    }
});

router.get('/edit/(:id)', function (req, res, next) {
    let id = req.params.id;
    connection.query
        ('SELECT * FROM dpi WHERE id_dpi = ' + id, function (err, rows) {
        if (err) {
            req.flash('eror', 'query gagal');
        }
        else {
            res.render('dpi/edit', {
                id: rows[0].id_dpi,
                nama: rows[0].nama_dpi,
                luas: rows[0].luas
            })
        }
    })
});

router.post('/update/(:id)', function (req, res, next) {
    try {
        let id = req.params.id;
        let { nama_dpi, luas } = req.body;
        let Data = {
          nama_dpi: nama_dpi,
          luas: luas
        }
        connection.query('update dpi set ? where id_dpi = ' + id, Data, function (err) {
            if (err) {
                console.error('Query Error:', err); 
                req.flash('eror', 'gagal query' + err.message);
            } else {
                req.flash('success', 'Berhasil memperbaharui data' );
            }
            res.redirect('/dpi');
        })
    } catch (error) {
        req.flash('eror', 'Terjadi kesalahan pada router');
        res.redirect('/dpi');
    }
});

router.get('/delete/(:id)', function (req, res, next) {
    let id = req.params.id;
    connection.query('delete from dpi where id_dpi = ' + id, function (err) {
        if (err) {
            req.flash('eror', 'gagal query');
        } else {
            req.flash('success', 'Data deleted successfully');
        }
        res.redirect('/dpi');
    })
});

module.exports = router;
