var express = require('express')
,	fs 		= require('fs');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	fs.readFile('./output.json', function(err, data) {
		if (err) throw err;

		var postings = JSON.parse(data.toString() || '[]');
		postings.forEach(function(post, index){
			post.displayClass = '';

			if (post.jobTitle.search(/S(enio)?r/i) > -1) {
				post.displayClass = 'Senior';
			}
			else if (post.jobTitle.search(/J(unio)?r/i) > -1) {
				post.displayClass = 'Junior';
			}
		})

  		res.render('posts', { listings: postings });
		
	})

});

module.exports = router;