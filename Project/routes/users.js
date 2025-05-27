var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('users/index');
});

router.get('/add', function (req, res, next) {
  res.render('users/add_campaign');
})

module.exports = router;