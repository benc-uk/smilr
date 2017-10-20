const express = require('express');
const router = express.Router();

// /about page
router
.get('/feedback/:topic', function (req, res, next) {

  res.render('feedback', 
  { 
    title: `Feedback for ${req.params.topic}`
  });
})
.get('/feedback', function (req, res, next) {
    if(!req.query.topic) res.send(400);

    res.redirect(`/feedback/${req.query.topic}`)
})

.post('/feedback', function (req, res, next) {
  
  if (!req.body) return res.sendStatus(400)
  console.log('rating, ' + req.body.rating);
  console.log('comments, ' + req.body.comments);
  
  res.redirect('/confirm');
})

module.exports = router;
