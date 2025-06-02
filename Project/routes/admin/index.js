var express = require('express');
var router = express.Router();
const argon2 = require('argon2');
const db = require('../../config/db');

const campaignRouter = require('./campaign');
const penyaluranRouter = require('./penyaluran');
const penggunaRouter = require('./pengguna');

router.use('/campaign', campaignRouter);
router.use('/penyaluran', penyaluranRouter);
router.use('/pengguna', penggunaRouter);

router.get('/', function (req, res, next) {
    const user = req.session.user;

    const query1 = 'SELECT * FROM v_quick_pengajuan_campaigns';
    const query2 = 'SELECT * FROM v_dashboard_stats';

    db.query(query1, function (err1, rows1) {
        if (err1) {
            req.flash('error', err1);
            return res.redirect('/');
        }

        db.query(query2, function (err2, rows2) {
            if (err2) {
                req.flash('error', err2);
                return res.redirect('/');
            }

            res.render('master/index', {
                data: rows1, // hasil query pertama
                rows: rows2[0], // hasil query kedua
                user
            });
        });
    });
});

router.get('/profile', function (req, res, next) {
    // console.log('Session user:', req.session.user);
    const user = req.session.user;
    res.render('master/profile', { user });
});

// Update profil (nama, email) + update password jika diisi
router.post('/update/:id', async function (req, res, next) {
  const id = req.params.id;
  const { nama, email, password } = req.body;

  // Validasi awal
  if (!nama || !email) {
    req.flash('error', 'Nama dan email tidak boleh kosong.');
    return res.redirect('/admin/profile');
  }

  try {
    let query, values;

    if (password && password.trim() !== '') {
        const hashedPassword = await argon2.hash(password);

      query = 'UPDATE users SET nama = ?, email = ?, password = ? WHERE id_user = ?';
      values = [nama, email, hashedPassword, id];
    } else {
      query = 'UPDATE users SET nama = ?, email = ? WHERE id_user = ?';
      values = [nama, email, id];
    }

    db.query(query, values, function (err, result) {
      if (err) {
        console.error(err);
        req.flash('error', 'Terjadi kesalahan saat mengupdate data.');
        return res.redirect('/admin/profile');
      }

      db.query('SELECT * FROM users WHERE id_user = ?', [id], function (err2, rows) {
        if (err2 || rows.length === 0) {
          console.error(err2 || 'User tidak ditemukan setelah update.');
          req.flash('error', 'Profil diperbarui, tapi gagal memuat ulang data.');
          return res.redirect('/admin/profile');
        }

        req.session.user = rows[0];

        req.flash('success', 'Profil berhasil diperbarui.');
        return res.redirect('/admin/profile');
      });
    });

  } catch (error) {
    console.error(error);
    req.flash('error', 'Gagal mengupdate profil.');
    return res.redirect('/admin/profile');
  }
});



module.exports = router;