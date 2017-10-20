const express = require('express');
const router = express.Router();

// /about page
router
.get('/about', function (req, res, next) {
  res.render('about', 
  { 
    title: 'About'
  });
})

module.exports = router;
