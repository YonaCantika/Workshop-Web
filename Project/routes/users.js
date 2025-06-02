var express = require('express');
var router = express.Router();
const argon2 = require('argon2');
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
  const user = req.session.user;
  res.render('users/index', { user });
});

router.get('/add', function (req, res, next) {
  console.log('Session user:', req.session.user);
  res.render('users/add_campaign');
});

router.post('/add_campaign', upload.single('foto_campaign'), function (req, res, next) {
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
  const user = req.session.user;

  if (!user) {
    return res.redirect('/login');
  }

  const sql = 'SELECT * FROM v_log_donasi_users WHERE id_user = ?';

  db.query(sql, [user.id_user], function (err, results) {
    if (err) return next(err);

    res.render('users/log_donasi', {
      user,
      log_donasi: results // kirim data ke template
    });
  });
});

router.get('/logCampaign', function (req, res, next) {
  const user = req.session.user;
  const status = req.query.status;

  if (!user) return res.redirect('/login');

  let sql = 'SELECT * FROM v_campaigns_per_user WHERE id_user = ?';
  let params = [user.id_user];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  db.query(sql, params, function (err, results) {
    if (err) return next(err);

    res.render('users/log_campaign', {
      user,
      log: results,
      status // kirim ke EJS
    });
  });
});

router.get('/edit', function(req, res, next) {
  const id = req.session.user.id_user;

  db.query('SELECT * FROM users WHERE id_user = ?', [id], function(err, results) {
    if (err) {
      req.flash('error', 'Gagal mengambil data user');
      return res.redirect('/');
    }
    if (results.length === 0) {
      req.flash('error', 'User tidak ditemukan');
      return res.redirect('/');
    }

    res.render('users/edit_profile', {
      user: results[0]
    });
  });
});

router.get('/change-password', function (req, res, next) {
  res.render('users/change_pass');
});
router.get('/edit-profile', function (req, res, next) {
  res.render('users/edit_profile');
});

// Route update nama dan email
router.post('/update-profile/:id', function (req, res, next) {
  const id = req.params.id;
  const { nama, email } = req.body;

  if (!nama || !email) {
    req.flash('error', 'Nama dan email tidak boleh kosong.');
    return res.redirect('/users/edit');
  }

  const sql = 'UPDATE users SET nama = ?, email = ? WHERE id_user = ?';

  db.query(sql, [nama, email, id], function (err, result) {
    if (err) {
      console.error(err);
      req.flash('error', 'Terjadi kesalahan saat mengupdate profil.');
      return res.redirect('/users/edit');
    }

    req.flash('success', 'Profil berhasil diperbarui.');
    return res.redirect('/users/edit');
  });
});

router.post('/update-password/:id', async function (req, res, next) {
  const id = req.params.id;
  const { password, confirm_password } = req.body;

  if (!password || !confirm_password) {
    req.flash('error', 'Password dan konfirmasi tidak boleh kosong.');
    return res.redirect('/users/change-password');
  }

  if (password !== confirm_password) {
    req.flash('error', 'Konfirmasi password tidak cocok.');
    return res.redirect('/users/change-password');
  }

  try {
    const hashedPassword = await argon2.hash(password);

    const sql = 'UPDATE users SET password = ? WHERE id_user = ?';
    db.query(sql, [hashedPassword, id], function (err, result) {
      if (err) {
        console.error(err);
        req.flash('error', 'Terjadi kesalahan saat mengupdate password.');
        return res.redirect('/users/edit');
      }

      req.flash('success', 'Password berhasil diperbarui.');
      return res.redirect('/users/edit');
    });

  } catch (error) {
    console.error(error);
    req.flash('error', 'Gagal mengenkripsi password.');
    return res.redirect('/users/edit');
  }
});

module.exports = router;