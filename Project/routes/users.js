var express = require('express');
var router = express.Router();
var db = require('../config/db.js');

const multer = require('multer');
const path = require('path');

// Setup penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = file.fieldname + '-' + Date.now() + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });


/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log('Session user:', req.session.user);
  res.render('users/index');
});

router.get('/add', function (req, res, next) {
  console.log('Session user:', req.session.user);
  res.render('users/add_campaign');
});

router.post('/add_campaign',  upload.single('foto_campaign'), function (req, res, next) {
  try {
    console.log('Session user:', req.session.user);
    const id_user = req.session.user && req.session.user.id_user; // pastikan user login
    let { judul, deskripsi, target_dana, tanggal_berakhir } = req.body;
    const foto_campaign = req.file ? req.file.filename : null; // Nama file yg diupload

    if (!id_user) {
      req.flash('error', 'Silakan login terlebih dahulu');
      return res.redirect('/login');
    }

    const sql = 'INSERT INTO campaigns (id_user, judul, foto_campaign, deskripsi, target_dana, tanggal_berakhir) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [id_user, judul, foto_campaign, deskripsi, target_dana, tanggal_berakhir], function (err, result) {
      if (err) {
        req.flash('error', 'Gagal menyimpan data: ' + err.message);
      } else {
        req.flash('success', 'Berhasil menyimpan data');
      }
      res.redirect('/users');
    });
  } catch (error) {
    console.error('Catch error:', error);
    req.flash('error', 'Terjadi Kesalahan pada fungsi');
    res.redirect('/users');
  }
});

router.get('/log', function (req, res, next) {
  console.log('Session user:', req.session.user);
  res.render('users/log_campaign');
});

module.exports = router;