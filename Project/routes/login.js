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
      return res.render("login", {
        title: "Login",
        error: "Terjadi kesalahan server"
      });
    }

    if (results.length !== 1) {
      return res.render("login", {
        title: "Login",
        error: "Username atau password salah, silakan coba lagi"
      });
    }

    const user = results[0];

    try {
      const valid = await argon2.verify(user.password, password);
      if (valid) {
        req.session.user = user;

        // Routing berdasarkan role
        if (user.role === 'superadmin') {
          return res.redirect("/admin");
        } else if (user.role === 'siswa') {
          return res.redirect("/users");
        } else {
          return res.render("login", {
            title: "Login",
            error: "Role pengguna tidak dikenali"
          });
        }

      } else {
        return res.render("login", {
          title: "Login",
          error: "Username atau password salah"
        });
      }
    } catch (err) {
      console.error(err);
      return res.render("login", {
        title: "Login",
        error: "Terjadi kesalahan saat verifikasi password"
      });
    }
  });
});

router.get("/logout", function (req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
