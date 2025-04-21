var express = require('express');
var router = express.Router();

var connection = require('../config/database.js');

router.get('/', function (req, res, next) {
    connection.query('select * from mahasiswa order by id_mahasiswa desc', function (err, rows) {
        if (err) {
            req.flash('error', err);
        } else {
            res.render('mahasiswa/index', {
                data: rows
            });
        }
    });
});

router.get('/create', function (req, res, next) {
    res.render('mahasiswa/create');
});

router.post("/store", function (req, res, next) {
    try {
        let { nama, nrp, tgl_lahir, jk, agama, hobby, alamat, prodi } = req.body;
        let Data = {
            nama,
            nrp,
            tgl_lahir,
            jk,
            agama,
            hobby,
            alamat,
            prodi
        }
        connection.query('insert into mahasiswa set ?', Data, function (err, result) {
            if (err) {
                req.flash('error', 'gagal menyimpan data' + err.message);
            } else {
                req.flash('success', 'berhasil menyimpan data');
            }
            res.redirect('/mahasiswa');
        })
    } catch (error) {
        req.flash('error', 'Terjadi Kesalahan pada fungsi');
        res.redirect('/mahasiswa');
    }
});

router.get('/edit/(:id)', function (req, res, next) {
    let id = req.params.id;
    connection.query
        ('SELECT id_mahasiswa, nama, nrp, DATE_FORMAT(tgl_lahir, "%Y-%m-%d") AS tgl_lahir, jk, agama, hobby, alamat, prodi FROM mahasiswa WHERE id_mahasiswa = ' + id, function (err, rows) {
        if (err) {
            req.flash('eror', 'query gagal');
        }
        else {
            res.render('mahasiswa/edit', {
                id: rows[0].id_mahasiswa,
                nama: rows[0].nama,
                nrp: rows[0].nrp,
                tgl_lahir: rows[0].tgl_lahir,
                jk: rows[0].jk,
                agama: rows[0].agama,
                hobby: rows[0].hobby,
                alamat: rows[0].alamat,
                prodi: rows[0].prodi
            })
        }
    })
});

router.post('/update/(:id)', function (req, res, next) {
    try {
        let id = req.params.id;
        let { nama, nrp, tgl_lahir, jk, agama, hobby, alamat, prodi } = req.body;
        let Data = {
            nama: nama,
            nrp: nrp,
            tgl_lahir: tgl_lahir,
            jk: jk,
            agama: agama,
            hobby: hobby,
            alamat: alamat,
            prodi: prodi
        }
        connection.query('update mahasiswa set ? where id_mahasiswa = ' + id, Data, function (err) {
            if (err) {
                console.error('Query Error:', err); 
                req.flash('eror', 'gagal query' + err.message);
            } else {
                req.flash('success', 'Berhasil memperbaharui data' );
            }
            res.redirect('/mahasiswa');
        })
    } catch (error) {
        req.flash('eror', 'Terjadi kesalahan pada router');
        res.redirect('/mahasiswa');
    }
});

router.get('/delete/(:id)', function (req, res, next) {
    let id = req.params.id;
    connection.query('delete from mahasiswa where id_mahasiswa = ' + id, function (err) {
        if (err) {
            req.flash('eror', 'gagal query');
        } else {
            req.flash('success', 'Data deleted successfully');
        }
        res.redirect('/mahasiswa');
    })
});

module.exports = router;
