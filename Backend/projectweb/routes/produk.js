var express = require('express');
var router = express.Router();

var connection = require('../config/database.js');

router.get('/', function(req, res, next) {
    connection.query('select * from produk p join kategori k on p.id_kategori=k.id_kategori order by p.id_produk desc', function (err, rows) {
        if (err) {
            req.flash('error', err);
        } else {
            res.render('produk/index', {
                data: rows
            });
        }
    });
});

router.get('/create', function (req, res, next) {
    connection.query('select * from kategori order by id_kategori desc', function (err, rows) {
        if (err) {
            req.flash('error', err);
        }
        else {
            res.render('produk/create', {
                data: rows
            });
        }
    });
});

router.post("/store", function (req, res, next) {
    try {
        let { nama_produk, harga_produk, id_kategori } = req.body;
        let Data = {
            nama_produk, harga_produk, id_kategori
        }
        connection.query('insert into produk set ?', Data, function (err, result) {
            if (err) {
                req.flash('error', 'gagal menyimpan data' + err.message);
            } else {
                req.flash('success', 'berhasil menyimpan data');
            }
            res.redirect('/produk');
        })
    } catch (error) {
        req.flash('eror', 'Terjadi Kesalahan pada fungsi');
        res.redirect('/produk');
    }
})

router.get('/edit/(:id)', function (req, res, next) { 
    let id = req.params.id;
    let queryProduk = 'SELECT * FROM produk WHERE id_produk = ?';
    let queryKategori = 'SELECT * FROM kategori ORDER BY id_kategori DESC';

    connection.query(queryProduk, [id], function (err, produkRows) {
        if (err || produkRows.length === 0) {
            req.flash('error', 'Produk tidak ditemukan');
            return res.redirect('/produk');
        }

        connection.query(queryKategori, function (err, kategoriRows) {
            if (err) {
                req.flash('error', 'Gagal mengambil data kategori');
                return res.redirect('/produk');
            }

            res.render('produk/edit', {
                id: produkRows[0].id_produk,
                nama: produkRows[0].nama_produk,
                harga: produkRows[0].harga_produk,
                id_kategori: produkRows[0].id_kategori, // kategori terpilih
                data: kategoriRows // semua kategori
            });
        });
    });
});


router.post('/update/(:id)', function (req, res, next) {
    try {
        let id = req.params.id;
        let { nama_produk, harga_produk, id_kategori } = req.body;
        let Data = {
            nama_produk: nama_produk,
            harga_produk: harga_produk,
            id_kategori: id_kategori
        }
        connection.query('update produk set ? where id_produk = ' + id, Data, function (err) {
            if (err) {
                req.flash('eror', 'gagal query');
            } else {
                req.flash('success', 'Berhasil memperbaharui data');
            }
            res.redirect('/produk');
        })
    } catch (error) {
        req.flash('eror', 'Terjadi kesalahan pada router');
        req.redirect('/produk');
    }
})

router.get('/delete/(:id)', function (req, res, next) {
    let id = req.params.id;
    connection.query('delete from produk where id_produl = ' + id, function (err) {
        if (err) {
            req.flash('eror', 'gagal query');
        } else {
            req.flash('success', 'Data deleted successfully');
        }
        res.redirect('/produk');
    })
})

module.exports = router;
