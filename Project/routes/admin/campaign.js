var express = require('express');
var router = express.Router();
const db = require('../../config/db');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/images'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = file.fieldname + '-' + Date.now() + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

router.get('/', function (req, res, next) {
  const status = req.query.status;

  let query = 'SELECT * FROM v_campaign';
  let params = [];

  if (status) {
      query += ' WHERE status = ?';
      params.push(status);
  }

  db.query(query, params, function (err, rows) {
      if (err) {
          req.flash('error', err);
          res.redirect('/admin');
      } else {
          res.render('master/campaign/index', {
              data: rows,
              selectedStatus: status || ''
          });
      }
  });
});


router.get('/create', function (req, res, next) {
    res.render('master/campaign/create')
});

router.post('/store', upload.single('foto_campaign'), function (req, res, next) {
    try {
      console.log('Session user:', req.session.user);
      const id_user = req.session.user && req.session.user.id_user; // pastikan user login
      let { judul, deskripsi, target_dana, tanggal_berakhir } = req.body;
      const foto_campaign = req.file ? req.file.filename : null; // Nama file yg diupload
  
      if (!id_user) {
        req.flash('error', 'Silakan login terlebih dahulu');
        return res.redirect('/login');
      }
  
      const sql = 'INSERT INTO campaigns (id_user, judul, foto_campaign, deskripsi, target_dana, tanggal_berakhir, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
      db.query(sql, [id_user, judul, foto_campaign, deskripsi, target_dana, tanggal_berakhir, 'aktif'], function (err, result) {
        if (err) {
          req.flash('error', 'Gagal menyimpan data: ' + err.message);
        } else {
          req.flash('success', 'Berhasil menyimpan data');
        }
        res.redirect('/admin/campaign');
      });
    } catch (error) {
      console.error('Catch error:', error);
      req.flash('error', 'Terjadi Kesalahan pada fungsi');
      res.redirect('/admin/campaign');
    }
});

router.get('/edit/(:id)', function (req, res, next) {
    let id = req.params.id;
    db.query('SELECT * FROM campaigns WHERE id_campaign = ' + [id], function (err, rows) {
        if (err) {
            req.flash('eror', 'query gagal');
        } else {
            res.render('master/campaign/edit', {
                id: rows[0].id_campaign,
                judul: rows[0].judul,
                deskripsi: rows[0].deskripsi,
                target_dana: rows[0].target_dana,
                dana_terkumpul: rows[0].dana_terkumpul,
                tanggal_berakhir: rows[0].tanggal_berakhir,
                foto_campaign: rows[0].foto_campaign,
                status: rows[0].status
            })
        }
    })
});

router.post('/update/:id', upload.single('foto_campaign'), function (req, res, next) {
  const id = req.params.id;
  const { judul, deskripsi, target_dana, tanggal_berakhir, status, foto_campaign_lama } = req.body;

  const foto_campaign = req.file ? req.file.filename : foto_campaign_lama;

  const sql = `UPDATE campaigns SET judul=?, foto_campaign=?, deskripsi=?, target_dana=?, tanggal_berakhir=?, status=? WHERE id_campaign=?`;

  db.query(sql, [judul, foto_campaign, deskripsi, target_dana, tanggal_berakhir, status, id], function (err, result) {
    if (err) {
      req.flash('error', 'Gagal update data: ' + err.message);
      return res.redirect('/admin/campaign');
    }

    // Jika upload file baru dan ada foto lama, hapus foto lama
    if (req.file && foto_campaign_lama) {
      const pathFotoLama = path.join(__dirname, '../../public/images', foto_campaign_lama);
      fs.unlink(pathFotoLama, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Gagal menghapus foto lama:', err);
        }
      });
    }

    req.flash('success', 'Berhasil update campaign');
    res.redirect('/admin/campaign');
  });
});

  
router.get('/delete/:id', function (req, res, next) {
  const id = req.params.id;

  // Ambil dulu nama file fotonya
  db.query('SELECT foto_campaign FROM campaigns WHERE id_campaign = ?', [id], function (err, result) {
    if (err || result.length === 0) {
      req.flash('error', 'Gagal mengambil data untuk dihapus');
      return res.redirect('/admin/campaign');
    }

    const foto = result[0].foto_campaign;

    // Hapus data campaign
    db.query('DELETE FROM campaigns WHERE id_campaign = ?', [id], function (err2) {
      if (err2) {
        req.flash('error', 'Gagal menghapus data');
        return res.redirect('/admin/campaign');
      }

      // Jika ada foto, hapus file dari folder
      if (foto) {
        const pathFoto = path.join(__dirname, '../../public/images', foto);
        fs.unlink(pathFoto, (err3) => {
          if (err3 && err3.code !== 'ENOENT') {
            console.error('Gagal menghapus foto:', err3);
          }
        });
      }

      req.flash('success', 'Data dan foto berhasil dihapus');
      res.redirect('/admin/campaign');
    });
  });
});


router.get('/update-status/:id', function(req, res, next) {
  const id = req.params.id;
  const status = req.query.status; // 'aktif' atau 'ditolak'

  if (!['aktif', 'ditolak'].includes(status)) {
    req.flash('error', 'Status tidak valid.');
    return res.redirect('/admin/campaign');
  }

  const sql = 'UPDATE campaigns SET status = ? WHERE id_campaign = ?';
  db.query(sql, [status, id], function(err, result) {
    if (err) {
      req.flash('error', 'Gagal update status: ' + err.message);
    } else {
      req.flash('success', 'Status campaign berhasil diperbarui.');
    }
    res.redirect('/admin/campaign');
  });
});


module.exports = router;