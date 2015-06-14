var express = require('express')
,	fs 		= require('fs');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	fs.readFile('./output.json', function(err, data) {
		if (err) throw err;

  		res.render('posts', { title: 'daaata', listings: data.toString() });
		
	})

});

module.exports = router;