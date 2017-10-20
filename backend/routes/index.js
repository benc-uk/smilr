const express = require('express');
const router = express.Router();

// Index and root
router
.get('/', function (req, res, next) {
  res.render('index', 
  { 
    title: 'Home',
    showDialog: false
  });
})

.get('/confirm', function (req, res, next) {
  res.render('index', 
  { 
    title: 'Home',
    showDialog: true
  });
})

module.exports = router;
