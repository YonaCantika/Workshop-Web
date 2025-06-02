var express = require('express');
var router = express.Router();
const argon2 = require('argon2');
const db = require('../config/db');

/* GET users listing. */
router.post('/next', function (req, res) {
    const { nama, email } = req.body;
    // Kirim ke halaman input username/password sambil bawa data nama dan email
    res.render('register', { nama, email });
});

router.post('/register', async (req, res) => {
    const { nama, email, username, password, confirm_password } = req.body;
  
    if (password !== confirm_password) {
      req.flash('error', 'Password dan konfirmasi tidak cocok');
      // Render ulang halaman register dengan data lama, flash bisa diakses di template
      return res.render('register', { nama, email, username });
    }
  
    try {
      const hashedPassword = await argon2.hash(password);
  
      db.query(
        'INSERT INTO users (nama, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [nama, username, email, hashedPassword, 'siswa'],
        function (err) {
          if (err) {
            console.error(err);
            req.flash('error', 'Gagal menyimpan data');
            return res.render('register', { nama, email, username });
          }
  
          req.flash('success', 'Registrasi berhasil. Silakan login.');
          res.redirect('/login');
        }
      );
    } catch (err) {
      console.error(err);
      req.flash('error', 'Terjadi kesalahan saat hashing password');
      return res.render('register', { nama, email, username });
    }
});
  
  

module.exports = router;