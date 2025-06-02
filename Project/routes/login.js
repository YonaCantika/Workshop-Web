var express = require('express');
var router = express.Router();
const argon2 = require("argon2");
var db = require('../config/db.js');

/* GET login page */
router.get('/', function (req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post("/", function (req, res, next) {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async function (err, results) {
    if (err) {
      console.error(err);
      req.flash('error', 'Terjadi kesalahan server');
      return res.redirect('/login'); // redirect supaya flash bisa tampil
    }

    if (results.length !== 1) {
      req.flash('error', 'Username atau password salah, silakan coba lagi');
      return res.redirect('/login');
    }

    const user = results[0];

    try {
      const valid = await argon2.verify(user.password, password);
      if (valid) {
        req.session.user = user;

        if (user.role === 'superadmin' || user.role === 'admin') {
          return res.redirect("/admin");
        } else if (user.role === 'siswa') {
          return res.redirect("/users");
        } else {
          req.flash('error', 'Role pengguna tidak dikenali');
          return res.redirect('/login');
        }
      } else {
        req.flash('error', 'Username atau password salah');
        return res.redirect('/login');
      }
    } catch (err) {
      console.error(err);
      req.flash('error', 'Terjadi kesalahan saat verifikasi password');
      return res.redirect('/login');
    }
  });
});


router.get("/logout", function (req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
});



module.exports = router;
