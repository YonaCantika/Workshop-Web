-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 02, 2025 at 06:41 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bantuteman`
--

-- --------------------------------------------------------

--
-- Table structure for table `campaigns`
--

CREATE TABLE `campaigns` (
  `id_campaign` int NOT NULL,
  `id_user` int NOT NULL,
  `judul` varchar(100) NOT NULL,
  `foto_campaign` varchar(255) DEFAULT NULL,
  `deskripsi` text NOT NULL,
  `target_dana` decimal(12,2) NOT NULL,
  `dana_terkumpul` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tanggal_dibuat` datetime DEFAULT CURRENT_TIMESTAMP,
  `tanggal_berakhir` date NOT NULL,
  `status` enum('pending','aktif','selesai','ditolak') NOT NULL DEFAULT 'pending',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `campaigns`
--

INSERT INTO `campaigns` (`id_campaign`, `id_user`, `judul`, `foto_campaign`, `deskripsi`, `target_dana`, `dana_terkumpul`, `tanggal_dibuat`, `tanggal_berakhir`, `status`, `updated_at`) VALUES
(6, 2, 'Bantu kami mendirikan asrama untuk Panti Asuhan Assomadiyah', 'foto_campaign-1748430574473.jpg', 'Bantu Panti Asuhan As-Somadiyah untuk meningkatkan kualitas pendidikan bagi Yatim Piatu. Ciptakan masa depan yatim piatu yang cerah hingga mengenyam pendidikan tingggi.', '2000000.00', '0.00', '2025-05-28 18:09:34', '2025-06-08', 'aktif', '2025-06-02 00:34:24'),
(10, 2, 'Beasiswa Santri Al-Mizan untuk santri berprestasi dan kurang mampu', 'foto_campaign-1748432627712.jpg', 'Mari kita bantu para santri-santri Al-Mizan yang kurang mampu untuk menimba Ilmu di Pondok Pesantren Modern Al-Mizan', '2000000.00', '0.00', '2025-05-28 18:43:47', '2025-06-09', 'aktif', '2025-06-02 00:34:01');

-- --------------------------------------------------------

--
-- Table structure for table `donations`
--

CREATE TABLE `donations` (
  `id_donasi` int NOT NULL,
  `id_user` int DEFAULT NULL,
  `id_campaign` int NOT NULL,
  `jumlah_donasi` decimal(12,2) NOT NULL,
  `tanggal_donasi` datetime DEFAULT CURRENT_TIMESTAMP,
  `metode_pembayaran` varchar(50) NOT NULL,
  `bukti_transfer` varchar(255) DEFAULT NULL,
  `anonim` tinyint(1) DEFAULT '0'
) ;

--
-- Triggers `donations`
--
DELIMITER $$
CREATE TRIGGER `after_delete_donation` AFTER DELETE ON `donations` FOR EACH ROW BEGIN
  UPDATE campaigns
  SET dana_terkumpul = (
    SELECT COALESCE(SUM(jumlah_donasi), 0)
    FROM donations
    WHERE id_campaign = OLD.id_campaign
  )
  WHERE id_campaign = OLD.id_campaign;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_donation` AFTER INSERT ON `donations` FOR EACH ROW BEGIN
  UPDATE campaigns
  SET dana_terkumpul = (
    SELECT SUM(jumlah_donasi)
    FROM donations
    WHERE id_campaign = NEW.id_campaign
  )
  WHERE id_campaign = NEW.id_campaign;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_update_donation` AFTER UPDATE ON `donations` FOR EACH ROW BEGIN
  -- Jika campaign sebelumnya berubah
  IF OLD.id_campaign != NEW.id_campaign THEN
    -- Update campaign lama
    UPDATE campaigns
    SET dana_terkumpul = (
      SELECT COALESCE(SUM(jumlah_donasi), 0)
      FROM donations
      WHERE id_campaign = OLD.id_campaign
    )
    WHERE id_campaign = OLD.id_campaign;

    -- Update campaign baru
    UPDATE campaigns
    SET dana_terkumpul = (
      SELECT SUM(jumlah_donasi)
      FROM donations
      WHERE id_campaign = NEW.id_campaign
    )
    WHERE id_campaign = NEW.id_campaign;
  ELSE
    -- Jika campaign tidak berubah
    UPDATE campaigns
    SET dana_terkumpul = (
      SELECT SUM(jumlah_donasi)
      FROM donations
      WHERE id_campaign = NEW.id_campaign
    )
    WHERE id_campaign = NEW.id_campaign;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `set_anonim_if_user_null` BEFORE INSERT ON `donations` FOR EACH ROW BEGIN
    IF NEW.id_user IS NULL THEN
        SET NEW.anonim = 1;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `penyaluran`
--

CREATE TABLE `penyaluran` (
  `id_penyaluran` int NOT NULL,
  `id_campaign` int NOT NULL,
  `jumlah_disalurkan` decimal(12,2) NOT NULL,
  `tanggal_penyaluran` date NOT NULL,
  `keterangan` text NOT NULL,
  `bukti_foto` varchar(255) DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('L_zV7KTOiXHxXn_8rYQTrWdtO5SkKCUC', 1748802995, '{\"cookie\":{\"originalMaxAge\":3600000,\"expires\":\"2025-06-01T18:31:34.685Z\",\"httpOnly\":true,\"path\":\"/\"},\"flash\":{}}');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` int NOT NULL,
  `nama` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('siswa','admin','alumni','superadmin') NOT NULL
) ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `nama`, `username`, `email`, `password`, `role`) VALUES
(1, 'yona', 'yona', 'yona@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$2lMNin8ugmajQ45R3dzDKA$VHDTiq2jwvihrIEsGc8lfFC4g1nF7JUXMQg0UC7pMH4', 'superadmin'),
(2, 'User Yona1', 'yona123', ' yona123@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$byHhmjcM3GWLDrtidI2sng$mmsI04jIfQevQgA75aHfEfskZGEGb1f8HXUFmmH3Deg', 'siswa'),
(5, 'yosi', 'yosi', 'yosi@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$ujnwcgYEt7sVli5CT4p0mg$ckEh+uTjvQps16V+WpoVq57ZyUvUDv+OWRhbgXQ9Zog', 'admin');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_all_campaigns`
-- (See below for the actual view)
--
CREATE TABLE `v_all_campaigns` (
`dana_terkumpul` decimal(34,2)
,`deskripsi` text
,`foto_campaign` varchar(255)
,`id_campaign` int
,`judul` varchar(100)
,`tanggal_berakhir` varchar(10)
,`tanggal_dibuat` varchar(10)
,`target_dana` decimal(12,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_campaign`
-- (See below for the actual view)
--
CREATE TABLE `v_campaign` (
`dana_terkumpul` decimal(12,2)
,`deskripsi` text
,`foto_campaign` varchar(255)
,`id_campaign` int
,`judul` varchar(100)
,`nama` varchar(100)
,`status` enum('pending','aktif','selesai','ditolak')
,`tanggal_berakhir` varchar(10)
,`tanggal_dibuat` varchar(10)
,`target_dana` decimal(12,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_campaigns_belum_disalurkan`
-- (See below for the actual view)
--
CREATE TABLE `v_campaigns_belum_disalurkan` (
`dana_terkumpul` decimal(12,2)
,`foto_campaign` varchar(255)
,`id_campaign` int
,`judul` varchar(100)
,`status` enum('pending','aktif','selesai','ditolak')
,`tanggal_berakhir` date
,`tanggal_dibuat` datetime
,`target_dana` decimal(12,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_campaigns_per_user`
-- (See below for the actual view)
--
CREATE TABLE `v_campaigns_per_user` (
`dana_terkumpul` decimal(12,2)
,`deskripsi` text
,`email` varchar(100)
,`foto_campaign` varchar(255)
,`id_campaign` int
,`id_user` int
,`judul_campaign` varchar(100)
,`nama_user` varchar(100)
,`status` enum('pending','aktif','selesai','ditolak')
,`tanggal_berakhir` varchar(10)
,`tanggal_dibuat` varchar(10)
,`target_dana` decimal(12,2)
,`username` varchar(50)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_campaigns_pilihan`
-- (See below for the actual view)
--
CREATE TABLE `v_campaigns_pilihan` (
`dana_terkumpul` decimal(34,2)
,`deskripsi` text
,`foto_campaign` varchar(255)
,`id_campaign` int
,`judul` varchar(100)
,`tanggal_berakhir` varchar(10)
,`tanggal_dibuat` varchar(10)
,`target_dana` decimal(12,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_campaigns_selesai`
-- (See below for the actual view)
--
CREATE TABLE `v_campaigns_selesai` (
`dana_terkumpul` decimal(12,2)
,`foto_campaign` varchar(255)
,`id_campaign` int
,`judul` varchar(100)
,`status` enum('pending','aktif','selesai','ditolak')
,`tanggal_berakhir` date
,`tanggal_dibuat` datetime
,`target_dana` decimal(12,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_campaigns_sudah_disalurkan`
-- (See below for the actual view)
--
CREATE TABLE `v_campaigns_sudah_disalurkan` (
`dana_terkumpul` decimal(12,2)
,`foto_campaign` varchar(255)
,`id_campaign` int
,`judul` varchar(100)
,`status` enum('pending','aktif','selesai','ditolak')
,`tanggal_berakhir` date
,`tanggal_dibuat` datetime
,`target_dana` decimal(12,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_dashboard_stats`
-- (See below for the actual view)
--
CREATE TABLE `v_dashboard_stats` (
`jumlah_campaign` bigint
,`jumlah_user` bigint
,`total_penyaluran` decimal(34,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_detail_campaigns_sudah_disalurkan`
-- (See below for the actual view)
--
CREATE TABLE `v_detail_campaigns_sudah_disalurkan` (
`bukti_foto` varchar(255)
,`dana_terkumpul` decimal(12,2)
,`id_campaign` int
,`id_penyaluran` int
,`judul` varchar(100)
,`jumlah_disalurkan` decimal(12,2)
,`keterangan` text
,`tanggal_berakhir` date
,`tanggal_penyaluran` varchar(10)
,`target_dana` decimal(12,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_donatur_count_per_campaign`
-- (See below for the actual view)
--
CREATE TABLE `v_donatur_count_per_campaign` (
`id_campaign` int
,`jumlah_donatur` bigint
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_jumlah_campaign_aktif`
-- (See below for the actual view)
--
CREATE TABLE `v_jumlah_campaign_aktif` (
`jumlah_campaign_aktif` bigint
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_log_donasi_users`
-- (See below for the actual view)
--
CREATE TABLE `v_log_donasi_users` (
`anonim` tinyint(1)
,`bukti_transfer` varchar(255)
,`dana_terkumpul` decimal(34,2)
,`deskripsi` text
,`email` varchar(100)
,`foto_campaign` varchar(255)
,`id_campaign` int
,`id_donasi` int
,`id_user` int
,`judul_campaign` varchar(100)
,`jumlah_donasi` decimal(12,2)
,`metode_pembayaran` varchar(50)
,`nama_user` varchar(100)
,`tanggal_berakhir` varchar(10)
,`tanggal_dibuat` varchar(10)
,`tanggal_donasi` varchar(10)
,`target_dana` decimal(12,2)
,`username` varchar(50)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_nama_donatur_per_campaign`
-- (See below for the actual view)
--
CREATE TABLE `v_nama_donatur_per_campaign` (
`bukti_transfer` varchar(255)
,`id_campaign` int
,`id_donasi` int
,`jumlah_donasi` decimal(12,2)
,`metode_pembayaran` varchar(50)
,`nama_donatur` varchar(100)
,`tanggal_donasi` varchar(10)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_quick_pengajuan_campaigns`
-- (See below for the actual view)
--
CREATE TABLE `v_quick_pengajuan_campaigns` (
`dana_terkumpul` decimal(12,2)
,`deskripsi` text
,`foto_campaign` varchar(255)
,`id_campaign` int
,`judul` varchar(100)
,`nama` varchar(100)
,`status` enum('pending','aktif','selesai','ditolak')
,`tanggal_berakhir` varchar(10)
,`tanggal_dibuat` varchar(10)
,`target_dana` decimal(12,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_total_donasi`
-- (See below for the actual view)
--
CREATE TABLE `v_total_donasi` (
`total_donasi` decimal(34,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_total_donatur`
-- (See below for the actual view)
--
CREATE TABLE `v_total_donatur` (
`total_donatur` bigint
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_users`
-- (See below for the actual view)
--
CREATE TABLE `v_users` (
`email` varchar(100)
,`id_user` int
,`nama` varchar(100)
,`password` varchar(255)
,`role` enum('siswa','admin','alumni','superadmin')
,`username` varchar(50)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_users_admin`
-- (See below for the actual view)
--
CREATE TABLE `v_users_admin` (
`email` varchar(100)
,`id_user` int
,`nama` varchar(100)
,`password` varchar(255)
,`role` enum('siswa','admin','alumni','superadmin')
,`username` varchar(50)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_users_siswa`
-- (See below for the actual view)
--
CREATE TABLE `v_users_siswa` (
`email` varchar(100)
,`id_user` int
,`nama` varchar(100)
,`password` varchar(255)
,`role` enum('siswa','admin','alumni','superadmin')
,`username` varchar(50)
);

-- --------------------------------------------------------

--
-- Structure for view `v_all_campaigns`
--
DROP TABLE IF EXISTS `v_all_campaigns`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_all_campaigns`  AS SELECT `c`.`id_campaign` AS `id_campaign`, `c`.`judul` AS `judul`, `c`.`foto_campaign` AS `foto_campaign`, `c`.`deskripsi` AS `deskripsi`, `c`.`target_dana` AS `target_dana`, date_format(`c`.`tanggal_dibuat`,'%d/%m/%Y') AS `tanggal_dibuat`, date_format(`c`.`tanggal_berakhir`,'%d/%m/%Y') AS `tanggal_berakhir`, coalesce(sum(`d`.`jumlah_donasi`),0) AS `dana_terkumpul` FROM (`campaigns` `c` left join `donations` `d` on((`c`.`id_campaign` = `d`.`id_campaign`))) WHERE (`c`.`status` = 'aktif') GROUP BY `c`.`id_campaign` ORDER BY `tanggal_dibuat` ASC  ;

-- --------------------------------------------------------

--
-- Structure for view `v_campaign`
--
DROP TABLE IF EXISTS `v_campaign`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_campaign`  AS SELECT `c`.`id_campaign` AS `id_campaign`, `c`.`judul` AS `judul`, `c`.`foto_campaign` AS `foto_campaign`, `c`.`deskripsi` AS `deskripsi`, `c`.`target_dana` AS `target_dana`, `c`.`dana_terkumpul` AS `dana_terkumpul`, date_format(`c`.`tanggal_dibuat`,'%d/%m/%Y') AS `tanggal_dibuat`, date_format(`c`.`tanggal_berakhir`,'%d/%m/%Y') AS `tanggal_berakhir`, `c`.`status` AS `status`, `u`.`nama` AS `nama` FROM (`campaigns` `c` join `users` `u` on((`c`.`id_user` = `u`.`id_user`))) ORDER BY `c`.`tanggal_dibuat` AS `DESCdesc` ASC  ;

-- --------------------------------------------------------

--
-- Structure for view `v_campaigns_belum_disalurkan`
--
DROP TABLE IF EXISTS `v_campaigns_belum_disalurkan`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_campaigns_belum_disalurkan`  AS SELECT `c`.`id_campaign` AS `id_campaign`, `c`.`judul` AS `judul`, `c`.`foto_campaign` AS `foto_campaign`, `c`.`dana_terkumpul` AS `dana_terkumpul`, `c`.`target_dana` AS `target_dana`, `c`.`tanggal_dibuat` AS `tanggal_dibuat`, `c`.`tanggal_berakhir` AS `tanggal_berakhir`, `c`.`status` AS `status` FROM `v_campaigns_selesai` AS `c` WHERE exists(select 1 from `penyaluran` `p` where (`p`.`id_campaign` = `c`.`id_campaign`)) is false ORDER BY `c`.`tanggal_berakhir` ASC  ;

-- --------------------------------------------------------

--
-- Structure for view `v_campaigns_per_user`
--
DROP TABLE IF EXISTS `v_campaigns_per_user`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_campaigns_per_user`  AS SELECT `u`.`id_user` AS `id_user`, `u`.`nama` AS `nama_user`, `u`.`username` AS `username`, `u`.`email` AS `email`, `c`.`id_campaign` AS `id_campaign`, `c`.`judul` AS `judul_campaign`, `c`.`foto_campaign` AS `foto_campaign`, `c`.`dana_terkumpul` AS `dana_terkumpul`, `c`.`deskripsi` AS `deskripsi`, `c`.`target_dana` AS `target_dana`, date_format(`c`.`tanggal_dibuat`,'%d/%m/%Y') AS `tanggal_dibuat`, date_format(`c`.`tanggal_berakhir`,'%d/%m/%Y') AS `tanggal_berakhir`, `c`.`status` AS `status` FROM (`campaigns` `c` join `users` `u` on((`c`.`id_user` = `u`.`id_user`))) ORDER BY `c`.`tanggal_dibuat` AS `DESCdesc` ASC  ;

-- --------------------------------------------------------

--
-- Structure for view `v_campaigns_pilihan`
--
DROP TABLE IF EXISTS `v_campaigns_pilihan`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_campaigns_pilihan`  AS SELECT `c`.`id_campaign` AS `id_campaign`, `c`.`judul` AS `judul`, `c`.`foto_campaign` AS `foto_campaign`, `c`.`deskripsi` AS `deskripsi`, `c`.`target_dana` AS `target_dana`, date_format(`c`.`tanggal_dibuat`,'%d/%m/%Y') AS `tanggal_dibuat`, date_format(`c`.`tanggal_berakhir`,'%d/%m/%Y') AS `tanggal_berakhir`, coalesce(sum(`d`.`jumlah_donasi`),0) AS `dana_terkumpul` FROM (`campaigns` `c` left join `donations` `d` on((`c`.`id_campaign` = `d`.`id_campaign`))) WHERE (`c`.`status` = 'aktif') GROUP BY `c`.`id_campaign` ORDER BY `tanggal_berakhir` ASC LIMIT 0, 33  ;

-- --------------------------------------------------------

--
-- Structure for view `v_campaigns_selesai`
--
DROP TABLE IF EXISTS `v_campaigns_selesai`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_campaigns_selesai`  AS SELECT `campaigns`.`id_campaign` AS `id_campaign`, `campaigns`.`judul` AS `judul`, `campaigns`.`foto_campaign` AS `foto_campaign`, `campaigns`.`dana_terkumpul` AS `dana_terkumpul`, `campaigns`.`target_dana` AS `target_dana`, `campaigns`.`tanggal_dibuat` AS `tanggal_dibuat`, `campaigns`.`tanggal_berakhir` AS `tanggal_berakhir`, `campaigns`.`status` AS `status` FROM `campaigns` WHERE (`campaigns`.`status` = 'selesai')  ;

-- --------------------------------------------------------

--
-- Structure for view `v_campaigns_sudah_disalurkan`
--
DROP TABLE IF EXISTS `v_campaigns_sudah_disalurkan`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_campaigns_sudah_disalurkan`  AS SELECT `c`.`id_campaign` AS `id_campaign`, `c`.`judul` AS `judul`, `c`.`foto_campaign` AS `foto_campaign`, `c`.`dana_terkumpul` AS `dana_terkumpul`, `c`.`target_dana` AS `target_dana`, `c`.`tanggal_dibuat` AS `tanggal_dibuat`, `c`.`tanggal_berakhir` AS `tanggal_berakhir`, `c`.`status` AS `status` FROM `v_campaigns_selesai` AS `c` WHERE exists(select 1 from `penyaluran` `p` where (`p`.`id_campaign` = `c`.`id_campaign`)) ORDER BY `c`.`tanggal_berakhir` ASC  ;

-- --------------------------------------------------------

--
-- Structure for view `v_dashboard_stats`
--
DROP TABLE IF EXISTS `v_dashboard_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_dashboard_stats`  AS SELECT (select count(0) from `users`) AS `jumlah_user`, (select count(0) from `campaigns`) AS `jumlah_campaign`, (select coalesce(sum(`penyaluran`.`jumlah_disalurkan`),0) from `penyaluran`) AS `total_penyaluran``total_penyaluran`  ;

-- --------------------------------------------------------

--
-- Structure for view `v_detail_campaigns_sudah_disalurkan`
--
DROP TABLE IF EXISTS `v_detail_campaigns_sudah_disalurkan`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_detail_campaigns_sudah_disalurkan`  AS SELECT `p`.`id_penyaluran` AS `id_penyaluran`, `c`.`id_campaign` AS `id_campaign`, `c`.`judul` AS `judul`, `c`.`dana_terkumpul` AS `dana_terkumpul`, `c`.`target_dana` AS `target_dana`, `c`.`tanggal_berakhir` AS `tanggal_berakhir`, `p`.`jumlah_disalurkan` AS `jumlah_disalurkan`, date_format(`p`.`tanggal_penyaluran`,'%d/%m/%Y') AS `tanggal_penyaluran`, `p`.`keterangan` AS `keterangan`, `p`.`bukti_foto` AS `bukti_foto` FROM (`penyaluran` `p` join `campaigns` `c` on((`p`.`id_campaign` = `c`.`id_campaign`))) WHERE (`c`.`status` = 'selesai') ORDER BY `p`.`tanggal_penyaluran` AS `DESCdesc` ASC  ;

-- --------------------------------------------------------

--
-- Structure for view `v_donatur_count_per_campaign`
--
DROP TABLE IF EXISTS `v_donatur_count_per_campaign`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_donatur_count_per_campaign`  AS SELECT `donations`.`id_campaign` AS `id_campaign`, count(distinct (case when (`donations`.`anonim` = 1) then concat('anonim_',`donations`.`id_donasi`) when (`donations`.`id_user` is null) then concat('guest_',`donations`.`id_donasi`) else `donations`.`id_user` end)) AS `jumlah_donatur` FROM `donations` GROUP BY `donations`.`id_campaign``id_campaign`  ;

-- --------------------------------------------------------

--
-- Structure for view `v_jumlah_campaign_aktif`
--
DROP TABLE IF EXISTS `v_jumlah_campaign_aktif`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_jumlah_campaign_aktif`  AS SELECT count(0) AS `jumlah_campaign_aktif` FROM `campaigns` WHERE (`campaigns`.`status` = 'aktif')  ;

-- --------------------------------------------------------

--
-- Structure for view `v_log_donasi_users`
--
DROP TABLE IF EXISTS `v_log_donasi_users`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_log_donasi_users`  AS SELECT `u`.`id_user` AS `id_user`, (case when (`d`.`anonim` = 1) then 'Anonim' else `u`.`nama` end) AS `nama_user`, `u`.`username` AS `username`, `u`.`email` AS `email`, `c`.`id_campaign` AS `id_campaign`, `vac`.`judul` AS `judul_campaign`, `vac`.`foto_campaign` AS `foto_campaign`, `vac`.`deskripsi` AS `deskripsi`, `vac`.`target_dana` AS `target_dana`, `vac`.`dana_terkumpul` AS `dana_terkumpul`, `vac`.`tanggal_dibuat` AS `tanggal_dibuat`, `vac`.`tanggal_berakhir` AS `tanggal_berakhir`, `d`.`id_donasi` AS `id_donasi`, `d`.`jumlah_donasi` AS `jumlah_donasi`, date_format(`d`.`tanggal_donasi`,'%d/%m/%Y') AS `tanggal_donasi`, `d`.`metode_pembayaran` AS `metode_pembayaran`, `d`.`bukti_transfer` AS `bukti_transfer`, `d`.`anonim` AS `anonim` FROM (((`donations` `d` join `users` `u` on((`d`.`id_user` = `u`.`id_user`))) join `v_all_campaigns` `vac` on((`d`.`id_campaign` = `vac`.`id_campaign`))) join `campaigns` `c` on((`d`.`id_campaign` = `c`.`id_campaign`))) ORDER BY `d`.`tanggal_donasi` AS `DESCdesc` ASC  ;

-- --------------------------------------------------------

--
-- Structure for view `v_nama_donatur_per_campaign`
--
DROP TABLE IF EXISTS `v_nama_donatur_per_campaign`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_nama_donatur_per_campaign`  AS SELECT `d`.`id_donasi` AS `id_donasi`, `d`.`id_campaign` AS `id_campaign`, (case when (`d`.`anonim` = 1) then 'Anonim' when (`d`.`id_user` is null) then 'Anonim' else `u`.`nama` end) AS `nama_donatur`, `d`.`jumlah_donasi` AS `jumlah_donasi`, date_format(`d`.`tanggal_donasi`,'%d/%m/%Y') AS `tanggal_donasi`, `d`.`metode_pembayaran` AS `metode_pembayaran`, `d`.`bukti_transfer` AS `bukti_transfer` FROM (`donations` `d` left join `users` `u` on((`d`.`id_user` = `u`.`id_user`))) ORDER BY `d`.`tanggal_donasi` AS `DESCdesc` ASC  ;

-- --------------------------------------------------------

--
-- Structure for view `v_quick_pengajuan_campaigns`
--
DROP TABLE IF EXISTS `v_quick_pengajuan_campaigns`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_quick_pengajuan_campaigns`  AS SELECT `c`.`id_campaign` AS `id_campaign`, `c`.`judul` AS `judul`, `c`.`foto_campaign` AS `foto_campaign`, `c`.`deskripsi` AS `deskripsi`, `c`.`target_dana` AS `target_dana`, `c`.`dana_terkumpul` AS `dana_terkumpul`, date_format(`c`.`tanggal_dibuat`,'%d/%m/%Y') AS `tanggal_dibuat`, date_format(`c`.`tanggal_berakhir`,'%d/%m/%Y') AS `tanggal_berakhir`, `c`.`status` AS `status`, `u`.`nama` AS `nama` FROM (`campaigns` `c` join `users` `u` on((`c`.`id_user` = `u`.`id_user`))) WHERE (`c`.`status` = 'pending') ORDER BY `c`.`tanggal_dibuat` ASC LIMIT 0, 55  ;

-- --------------------------------------------------------

--
-- Structure for view `v_total_donasi`
--
DROP TABLE IF EXISTS `v_total_donasi`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_total_donasi`  AS SELECT sum(`d`.`jumlah_donasi`) AS `total_donasi` FROM (`donations` `d` join `campaigns` `c` on((`d`.`id_campaign` = `c`.`id_campaign`))) WHERE (`c`.`status` = 'aktif')  ;

-- --------------------------------------------------------

--
-- Structure for view `v_total_donatur`
--
DROP TABLE IF EXISTS `v_total_donatur`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_total_donatur`  AS SELECT ((select count(distinct `donations`.`id_user`) from `donations` where ((`donations`.`anonim` = false) and (`donations`.`id_user` is not null))) + (select count(0) from `donations` where ((`donations`.`anonim` = true) and (`donations`.`id_user` is null)))) AS `total_donatur``total_donatur`  ;

-- --------------------------------------------------------

--
-- Structure for view `v_users`
--
DROP TABLE IF EXISTS `v_users`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_users`  AS SELECT `users`.`id_user` AS `id_user`, `users`.`nama` AS `nama`, `users`.`username` AS `username`, `users`.`email` AS `email`, `users`.`password` AS `password`, `users`.`role` AS `role` FROM `users` ORDER BY `users`.`id_user` AS `DESCdesc` ASC  ;

-- --------------------------------------------------------

--
-- Structure for view `v_users_admin`
--
DROP TABLE IF EXISTS `v_users_admin`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_users_admin`  AS SELECT `u`.`id_user` AS `id_user`, `u`.`nama` AS `nama`, `u`.`username` AS `username`, `u`.`email` AS `email`, `u`.`password` AS `password`, `u`.`role` AS `role` FROM `v_users` AS `u` WHERE (`u`.`role` = 'admin') ORDER BY `u`.`id_user` AS `DESCdesc` ASC  ;

-- --------------------------------------------------------

--
-- Structure for view `v_users_siswa`
--
DROP TABLE IF EXISTS `v_users_siswa`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_users_siswa`  AS SELECT `u`.`id_user` AS `id_user`, `u`.`nama` AS `nama`, `u`.`username` AS `username`, `u`.`email` AS `email`, `u`.`password` AS `password`, `u`.`role` AS `role` FROM `v_users` AS `u` WHERE (`u`.`role` = 'siswa') ORDER BY `u`.`id_user` AS `DESCdesc` ASC  ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `campaigns`
--
ALTER TABLE `campaigns`
  ADD PRIMARY KEY (`id_campaign`),
  ADD KEY `fk_campaign_user` (`id_user`);

--
-- Indexes for table `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`id_donasi`),
  ADD KEY `fk_donations_user` (`id_user`),
  ADD KEY `fk_donations_campaign` (`id_campaign`);

--
-- Indexes for table `penyaluran`
--
ALTER TABLE `penyaluran`
  ADD PRIMARY KEY (`id_penyaluran`),
  ADD KEY `fk_penyaluran_campaign` (`id_campaign`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `campaigns`
--
ALTER TABLE `campaigns`
  MODIFY `id_campaign` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `donations`
--
ALTER TABLE `donations`
  MODIFY `id_donasi` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `penyaluran`
--
ALTER TABLE `penyaluran`
  MODIFY `id_penyaluran` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `campaigns`
--
ALTER TABLE `campaigns`
  ADD CONSTRAINT `fk_campaign_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `donations`
--
ALTER TABLE `donations`
  ADD CONSTRAINT `fk_donations_campaign` FOREIGN KEY (`id_campaign`) REFERENCES `campaigns` (`id_campaign`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_donations_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `penyaluran`
--
ALTER TABLE `penyaluran`
  ADD CONSTRAINT `fk_penyaluran_campaign` FOREIGN KEY (`id_campaign`) REFERENCES `campaigns` (`id_campaign`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
