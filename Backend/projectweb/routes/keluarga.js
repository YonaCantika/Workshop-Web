var express = require('express');
var router = express.Router();

var connection = require('../config/database.js');

/* GET users listing. */
router.get('/', function (req, res, next) {
    connection.query('select * from kk order by no_kk desc', function (err, rows) {
        if (err) {
            req.flash('error', err);
        } else {
            res.render('keluarga/index', {
                data: rows
            });
        }
    });
});

router.get('/create', function (req, res, next) {
    res.render('keluarga/create');
});

router.post("/store", function (req, res, next) {
    try {
        let { no_kk, alamat, rt, rw, kode_pos, desa, kec, kab, prov } = req.body;
        let Data = {
            no_kk, alamat, rt, rw, kode_pos, desa, kec, kab, prov
        }
        connection.query('insert into kk set ?', Data, function (err, result) {
            if (err) {
                req.flash('error', 'gagal menyimpan data' + err.message);
            } else {
                req.flash('success', 'berhasil menyimpan data');
            }
            res.redirect('/keluarga');
        })
    } catch (error) {
        req.flash('error', 'Terjadi Kesalahan pada fungsi');
        res.redirect('/keluarga');
    }
});

router.get('/edit/(:id)', function (req, res, next) {
    let id = req.params.id;
    connection.query
        ('SELECT * FROM kk WHERE no_kk = ' + id, function (err, rows) {
        if (err) {
            req.flash('eror', 'query gagal');
        }
        else {
            res.render('keluarga/edit', {
                id: rows[0].no_kk,
                alamat: rows[0].alamat,
                rt: rows[0].rt,
                rw: rows[0].rw,
                kode_pos: rows[0].kode_pos,
                desa: rows[0].desa,
                kec: rows[0].kec,
                kab: rows[0].kab,
                prov: rows[0].prov
            })
        }
    })
});

router.post('/update/(:id)', function (req, res, next) {
    try {
        let id = req.params.id;
        let { alamat, rt, rw, kode_pos, desa, kec, kab, prov } = req.body;
        let Data = {
            alamat: alamat,
            rt: rt,
            rw: rw,
            kode_pos: kode_pos,
            desa: desa,
            kec: kec,
            kab: kab,
            prov: prov
        }
        connection.query('update kk set ? where no_kk = ' + id, Data, function (err) {
            if (err) {
                console.error('Query Error:', err); 
                req.flash('eror', 'gagal query' + err.message);
            } else {
                req.flash('success', 'Berhasil memperbaharui data' );
            }
            res.redirect('/keluarga');
        })
    } catch (error) {
        req.flash('eror', 'Terjadi kesalahan pada router');
        res.redirect('/keluarga');
    }
});

router.get('/delete/(:id)', function (req, res, next) {
    let id = req.params.id;
    connection.query('delete from kk where no_kk = ' + id, function (err) {
        if (err) {
            req.flash('eror', 'gagal query');
        } else {
            req.flash('success', 'Data deleted successfully');
        }
        res.redirect('/keluarga');
    })
});

module.exports = router;
