var express = require('express');
var router = express.Router();
const argon2 = require('argon2');
var db = require('../../config/db');
const flash = require('express-flash');

/* GET login page */
router.get('/', function (req, res, next) {
    const filter = req.query.filter;
    let query = 'SELECT * FROM v_users';

    if (filter === 'siswa') {
        query = 'SELECT * FROM v_users_siswa';
    } else if (filter === 'admin') {
        query = 'SELECT * FROM v_users_admin';
    }

    db.query(query, function (err, rows) {
        if (err) {
            req.flash('error', err);
            return res.render('master/users', {
                data: [],
                message: 'Terjadi kesalahan saat mengambil data.',
                selectedFilter: filter
            });
        }

        if (rows.length === 0) {
            return res.render('master/users', {
                data: [],
                message: filter === 'siswa'
                    ? 'Belum ada user siswa.'
                    : filter === 'admin'
                        ? 'Belum ada user admin.'
                        : 'Belum ada user.',
                selectedFilter: filter
            });
        }

        res.render('master/users', {
            data: rows,
            message: null,
            selectedFilter: filter
        });
    });
});

router.get('/create', function (req, res, next) {
    res.render('master/users/create')
})


router.post('/store', async function (req, res, next) {
    console.log('Isi req.body:', req.body);

    try {
        let { nama, username, email, password, role } = req.body;
        
        const hashedPassword = await argon2.hash(password);

        let data = { nama, username, email, password: hashedPassword, role };

        db.query('INSERT INTO users SET ? ', data, function (err, result) {
            if (err) {
                req.flash('error', 'Gagal menyimpan data: ' + err.message);
            } else {
                req.flash('success', 'Berhasil menyimpan user');
            }
            res.redirect('/admin/pengguna');
        });
    } catch (error) {
        req.flash('error', 'Terjadi Kesalahan pada fungsi: ' + error.message);
        res.redirect('/admin/pengguna');
    }
});

router.get('/edit/:id', function (req, res, next) {
    const id = req.params.id;
    db.query('SELECT * FROM users WHERE id_user = ' + id, function (err, result) {
        if (err) {
            flash('error', 'Gagal mengambil data');
        } else {
            res.render('master/users/edit', {
                rows: result[0]
            });
        }
    })
});

router.post('/update/:id', function (req, res, next) {
    const id = req.params.id;
    let { role } = req.body;
    let data = { role };
    db.query('UPDATE users SET ? WHERE id_user = ' + id, data, function (err, result) {
        if (err) {
            req.flash('error', 'Gagal update data');
            res.redirect('/admin/pengguna');
        } else {
            req.flash('success', 'Berhasil update role');
            res.redirect('/admin/pengguna');
        }
    });
});

router.get('/delete/:id', function (req, res, next) {
    const id = req.params.id;

    db.query('DELETE FROM users WHERE id_user = ?', [id], function (err) {
        if (err) {
            console.error(err);
            req.flash('error', 'Gagal menghapus data.');
        } else {
            req.flash('success', 'Data berhasil dihapus.');
        }
        res.redirect('/admin/pengguna');
    });
});



module.exports = router;