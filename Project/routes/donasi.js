const express = require('express');
const router = express.Router();
const db = require('../config/db');

const multer = require('multer');
const path = require('path');

// Setup penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/bukti_tf'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = file.fieldname + '-' + Date.now() + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

router.get('/(:id)', function (req, res, next) {
    const id = req.params.id;
    res.render('donasi', { id });
});

router.post('/store', upload.single('bukti_transfer'), function (req, res, next) {
    console.log('Session user:', req.session.user);
    try {
        const id_user = req.session.user ? req.session.user.id_user : null;

        let { id_campaign, jumlah_donasi, metode_pembayaran, anonim } = req.body;
        const bukti_transfer = req.file ? req.file.filename : null;

        let jumlah = Number(jumlah_donasi);
        if (isNaN(jumlah) || jumlah <= 0) {
            req.flash('error', 'Jumlah donasi harus angka dan lebih dari 0');
            return res.redirect(`/donasi/${id_campaign}`);
        }

        const sql = 'INSERT INTO donations (id_user, id_campaign, jumlah_donasi, metode_pembayaran, bukti_transfer, anonim) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(sql, [id_user, id_campaign, jumlah, metode_pembayaran, bukti_transfer, anonim], function (err, result) {
            if (err) {
                console.error('Error saat query insert:', err);
                req.flash('error', 'Gagal menyimpan data donasi');
                return res.redirect(`/donasi/${id_campaign}`);
            }
            req.flash('success', 'Donasi berhasil disimpan');
            res.redirect(`/all/detail/${id_campaign}`);
        });
    } catch (error) {
        console.error('Error di try catch:', error);
        req.flash('error', 'Terjadi Kesalahan pada fungsi');
        res.redirect(`/all/detail/${id_campaign}`);
    }
});

module.exports = router;
