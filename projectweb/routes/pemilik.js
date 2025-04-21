var express = require('express');
var router = express.Router();

var connection = require('../config/database.js');

router.get('/', function (req, res, next) {
    connection.query('select * from pemilik order by id_pemilik desc', function (err, rows) {
        if (err) {
            req.flash('error', err);
        } else {
            res.render('pemilik/index', {
                data: rows
            });
        }
    });
});

router.get('/create', function (req, res, next) {
  res.render('pemilik/create');
});

router.post("/store", function (req, res, next) {
  try {
      let { nama_pemilik, alamat, no_hp } = req.body;
      let Data = {
        nama_pemilik, alamat, no_hp
      }
      connection.query('insert into pemilik set ?', Data, function (err, result) {
          if (err) {
              req.flash('error', 'gagal menyimpan data' + err.message);
          } else {
              req.flash('success', 'berhasil menyimpan data');
          }
          res.redirect('/pemilik');
      })
  } catch (error) {
      req.flash('error', 'Terjadi Kesalahan pada fungsi');
      res.redirect('/pemilik');
  }
});

router.get('/edit/(:id)', function (req, res, next) {
  let id = req.params.id;
  connection.query
      ('SELECT * FROM pemilik WHERE id_pemilik = ' + id, function (err, rows) {
      if (err) {
          req.flash('eror', 'query gagal');
      }
      else {
          res.render('pemilik/edit', {
              id: rows[0].id_pemilik,
              nama: rows[0].nama_pemilik,
              alamat: rows[0].alamat,
              no_hp: rows[0].no_hp
          })
      }
  })
});

router.post('/update/(:id)', function (req, res, next) {
  try {
      let id = req.params.id;
      let { nama_pemilik, alamat, no_hp } = req.body;
      let Data = {
        nama_pemilik: nama_pemilik,
        alamat: alamat,
        no_hp: no_hp
      }
      connection.query('update pemilik set ? where id_pemilik = ' + id, Data, function (err) {
          if (err) {
              console.error('Query Error:', err); 
              req.flash('eror', 'gagal query' + err.message);
          } else {
              req.flash('success', 'Berhasil memperbaharui data' );
          }
          res.redirect('/pemilik');
      })
  } catch (error) {
      req.flash('eror', 'Terjadi kesalahan pada router');
      res.redirect('/pemilik');
  }
});

router.get('/delete/(:id)', function (req, res, next) {
  let id = req.params.id;
  connection.query('delete from pemilik where id_pemilik = ' + id, function (err) {
      if (err) {
          req.flash('eror', 'gagal query');
      } else {
          req.flash('success', 'Data deleted successfully');
      }
      res.redirect('/pemilik');
  })
});

module.exports = router;
