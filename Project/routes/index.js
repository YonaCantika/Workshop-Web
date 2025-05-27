var express = require('express');
var router = express.Router();
var db = require('../config/db.js');

router.get('/', function (req, res) {
  db.query('SELECT * FROM v_campaigns_pilihan', function (err, rekomendasi) {
    if (err) return renderError(res, req, err);

    db.query('SELECT * FROM v_jumlah_campaign_aktif', function (err2, jumlah) {
      if (err2) return renderError(res, req, err2, rekomendasi);

      db.query('SELECT * FROM v_total_donasi', function (err3, total) {
        if (err3) return renderError(res, req, err3, rekomendasi, jumlah);

        db.query('SELECT * FROM v_total_donatur', function (err4, donatur) {
          if (err4) return renderError(res, req, err4, rekomendasi, jumlah, total);

          res.render('index', {
            data: rekomendasi,
            jumlahAktif: jumlah[0]?.jumlah_campaign_aktif || 0,
            totalDonasi: total[0]?.total_donasi || 0,
            totalDonatur: donatur[0]?.total_donatur || 0
          });
        });
      });
    });
  });
});

function renderError(res, req, err, data = [], jumlah = [{
  jumlah_campaign_aktif: 0
}], total = [{
  total_donasi: 0
}], donatur = [{
  total_donatur: 0
}]) {
  req.flash('error', err);
  res.render('index', {
    data,
    jumlahAktif: jumlah[0]?.jumlah_campaign_aktif || 0,
    totalDonasi: total[0]?.total_donasi || 0,
    totalDonatur: donatur[0]?.total_donatur || 0
  });
}




module.exports = router;