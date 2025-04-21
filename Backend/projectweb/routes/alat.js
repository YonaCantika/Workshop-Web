var express = require('express');
var router = express.Router();

var connection = require('../config/database.js');

router.get('/', function (req, res, next) {
    connection.query('select * from alat_tangkap order by id_alat_tangkap desc', function (err, rows) {
        if (err) {
            req.flash('error', err);
        } else {
            res.render('alat/index', {
                data: rows
            });
        }
    });
});

router.get('/create', function (req, res, next) {
    res.render('alat/create');
});

router.post("/store", function (req, res, next) {
    try {
        let { nama_alat_tangkap } = req.body;
        let Data = {
            nama_alat_tangkap
        }
        connection.query('insert into alat_tangkap set ?', Data, function (err, result) {
            if (err) {
                req.flash('error', 'gagal menyimpan data' + err.message);
            } else {
                req.flash('success', 'berhasil menyimpan data');
            }
            res.redirect('/alat');
        })
    } catch (error) {
        req.flash('error', 'Terjadi Kesalahan pada fungsi');
        res.redirect('/alat');
    }
});

router.get('/edit/(:id)', function (req, res, next) {
    let id = req.params.id;
    connection.query
        ('SELECT * FROM alat_tangkap WHERE id_alat_tangkap = ' + id, function (err, rows) {
        if (err) {
            req.flash('eror', 'query gagal');
        }
        else {
            res.render('alat/edit', {
                id: rows[0].id_alat_tangkap,
                nama: rows[0].nama_alat_tangkap
            })
        }
    })
});

router.post('/update/(:id)', function (req, res, next) {
    try {
        let id = req.params.id;
        let { nama_alat_tangkap } = req.body;
        let Data = {
          nama_alat_tangkap: nama_alat_tangkap
        }
        connection.query('update alat_tangkap set ? where id_alat_tangkap = ' + id, Data, function (err) {
            if (err) {
                console.error('Query Error:', err); 
                req.flash('eror', 'gagal query' + err.message);
            } else {
                req.flash('success', 'Berhasil memperbaharui data' );
            }
            res.redirect('/alat');
        })
    } catch (error) {
        req.flash('eror', 'Terjadi kesalahan pada router');
        res.redirect('/alat');
    }
});

router.get('/delete/(:id)', function (req, res, next) {
    let id = req.params.id;
    connection.query('delete from alat_tangkap where id_alat_tangkap = ' + id, function (err) {
        if (err) {
            req.flash('eror', 'gagal query');
        } else {
            req.flash('success', 'Data deleted successfully');
        }
        res.redirect('/alat');
    })
  });

module.exports = router;
