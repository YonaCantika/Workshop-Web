var express = require('express');
var router = express.Router();
const db = require('../../config/db');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup penyimpanan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/images/bukti_penyaluran'));
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
    const filter = req.query.filter;
    let query = '';
    
    if (filter === 'belum') {
      query = 'SELECT * FROM v_campaigns_belum_disalurkan';
    } else if (filter === 'sudah') {
      query = 'SELECT * FROM v_detail_campaigns_sudah_disalurkan';
    } else {
      query = 'SELECT * FROM v_detail_campaigns_sudah_disalurkan';
    }
  
    db.query(query, function (err, rows) {
      if (err) {
        req.flash('error', err);
        return res.render('master/penyaluran/index', { data: [], message: null, selectedFilter: filter });
      }
  
      const message = rows.length === 0
        ? `Tidak ada campaign ${filter === 'belum' ? 'belum disalurkan' : 'sudah disalurkan'}.`
        : null;
  
      res.render('master/penyaluran/index', {
        data: rows,
        message: message,
        selectedFilter: filter
      });
    });
  });
  


router.get('/create', function (req, res, next) {
    db.query('SELECT * FROM v_campaigns_belum_disalurkan', function (err, rows) {
        if (err) {
            req.flash('error', err);
            return res.render('master/penyaluran/create', { data: [], message: null });
        }

        if (rows.length === 0) {
            return res.render('master/penyaluran/create', {
                data: [],
                message: 'Belum ada campaign dengan status selesai.'
            });
        }

        res.render('master/penyaluran/create', {
            data: rows,
            message: null
        });
    });
});

router.post('/store', upload.single('bukti_foto'), function (req, res, next) {
    try {
        let { id_campaign, jumlah_disalurkan, tanggal_penyaluran, keterangan } = req.body;
        let bukti_foto = req.file ? req.file.filename : null; // Nama file yg diupload
        let Data = {
            id_campaign, jumlah_disalurkan, tanggal_penyaluran, keterangan, bukti_foto
        }
        db.query('insert into penyaluran set ?', Data, function (err, result) {
            if (err) {
                req.flash('error', 'gagal menyimpan data' + err.message);
            } else {
                req.flash('success', 'berhasil menyimpan data');
            }
            res.redirect('/admin/penyaluran');
        })
    } catch (error) {
        req.flash('error', 'Terjadi Kesalahan pada fungsi');
        res.redirect('/admin/penyaluran');
    }
});

router.get('/edit/:id', function (req, res, next) {
    let id = req.params.id;

    db.query('SELECT * FROM v_campaigns_sudah_disalurkan', function (err, rows) {
        if (err) {
            req.flash('error', err);
            return res.render('master/penyaluran/edit', { data: [], message: null });
        }

        if (rows.length === 0) {
            return res.render('master/penyaluran/edit', {
                data: [],
                message: 'Belum ada campaign dengan status selesai.'
            });
        }

        // Ambil data penyaluran berdasarkan ID
        db.query('SELECT * FROM penyaluran WHERE id_penyaluran = ?', [id], function (err2, result) {
            if (err2) {
                req.flash('error', err2);
                return res.render('master/penyaluran/edit', { data: [], message: null });
            }

            res.render('master/penyaluran/edit', {
                data: rows, // ✅ array untuk dropdown
                selectedCampaign: result[0], // ✅ ini data yang sedang diedit
                message: null
            });
        });
    });
});

router.post('/update/:id', upload.single('bukti_foto'), function (req, res, next) {
    let id = req.params.id;
    let { id_campaign, jumlah_disalurkan, tanggal_penyaluran, keterangan } = req.body;
    let bukti_foto_baru = req.file ? req.file.filename : null;

    // Ambil data lama dulu
    db.query('SELECT bukti_foto FROM penyaluran WHERE id_penyaluran = ?', [id], function (err, result) {
        if (err || result.length === 0) {
            req.flash('error', 'Gagal mengambil data lama: ' + (err?.message || 'Data tidak ditemukan'));
            return res.redirect('/admin/penyaluran/edit/' + id);
        }

        const fotoLama = result[0].bukti_foto;
        const bukti_foto = bukti_foto_baru || fotoLama;

        const updateData = {
            id_campaign,
            jumlah_disalurkan,
            tanggal_penyaluran,
            keterangan,
            bukti_foto
        };

        db.query('UPDATE penyaluran SET ? WHERE id_penyaluran = ?', [updateData, id], function (err2, result2) {
            if (err2) {
                req.flash('error', 'Gagal mengupdate data: ' + err2.message);
                return res.redirect('/admin/penyaluran/edit/' + id);
            }

            // Jika ada foto baru, hapus foto lama dari folder
            if (bukti_foto_baru && fotoLama) {
                const pathFotoLama = path.join(__dirname, '../../public/images/bukti_penyaluran/', fotoLama);
                fs.unlink(pathFotoLama, (err3) => {
                    if (err3 && err3.code !== 'ENOENT') {
                        console.error('Gagal menghapus foto lama:', err3);
                    }
                });
            }

            req.flash('success', 'Data berhasil diperbarui');
            res.redirect('/admin/penyaluran');
        });
    });
});


router.get('/delete/:id', function (req, res, next) {
    let id = req.params.id;

    // Ambil data penyaluran dulu (buat ambil nama file fotonya)
    db.query('SELECT bukti_foto FROM penyaluran WHERE id_penyaluran = ?', [id], function (err, result) {
        if (err || result.length === 0) {
            req.flash('error', 'Gagal mengambil data untuk dihapus.');
            return res.redirect('/admin/penyaluran');
        }

        const foto = result[0].bukti_foto;

        // Hapus data dari database
        db.query('DELETE FROM penyaluran WHERE id_penyaluran = ?', [id], function (err2) {
            if (err2) {
                req.flash('error', 'Gagal menghapus data dari database.');
                return res.redirect('/admin/penyaluran');
            }

            // Jika ada foto, hapus file-nya dari folder
            if (foto) {
                const pathFoto = path.join(__dirname, '../../public/images/bukti_penyaluran/', foto);
                fs.unlink(pathFoto, (err3) => {
                    if (err3 && err3.code !== 'ENOENT') {
                        console.error('Gagal menghapus file foto:', err3);
                    }
                });
            }

            req.flash('success', 'Data deleted successfully');
            res.redirect('/admin/penyaluran');
        });
    });
});

module.exports = router;