var cheerio = require('cheerio'),
    url = require('url'),
    fs = require('fs'),
    request = require('request');



var requestURL = 'http://www.indeed.com/jobs?q=%22Software+Engineer%22&l=San+Diego,+ca&jt=fulltime&sort=date',
    results = [{"company": "Test company", "URL": "http://www.google.com", "jobTitle": "King in the castle", "jobID": "1337"}],
    pageNum = 0,
    jobID,
    nextURL = "",
    prevIDs;



function readPage(requestURL) {
    pageNum++;
    console.log('On page ' + pageNum)

    var reachedPrevData = false;

    request(requestURL, function(error, response, html){
        if(error){
            console.log('Got error', error)
            finalize();
        }
        else {
            var $ = cheerio.load(html);

            console.log('    Checking old results against... ');

            $('#resultsCol > .row.result').each(function(){
                var $this = $(this);

                jobID = $this.data('jk');
                console.log('         id %s', jobID);

                //Only add this job if it is actually new to us.
                if (!prevIDs || prevIDs.indexOf(jobID) == -1) {
                    results.push(buildPostObject($this, "Indeed"));
                }
                else {
                    console.log('Found an identical, breaking operation.');
                    reachedPrevData = true;
                    return false;
                }
            }); // /.each

            var $nextLink = $('.pagination > a').last();
            if (!reachedPrevData && $nextLink.length && pageNum < 1)  {
                nextURL = "http://" + url.parse(requestURL).host + $nextLink.attr('href') 
                readPage(nextURL);
            }
            else {
                finalize();
            }
        }
    }); // /request
}

function buildPostObject ($this, source) {
    var jobPost = {};
    switch (source) {
        case "Indeed":
            jobPost.source = source;
            jobPost.company = $this.find('.company').text();
            jobPost.URL     = url.parse(requestURL).host + $this.find('a').eq(0).attr('href');
            jobPost.jobTitle= $this.find('>h2>a').attr('title'); 
            jobPost.jobID   = $this.data('jk');
            break;
    }

    return jobPost
}

function finalize() {
    fs.writeFile('output.json', JSON.stringify(results, null, 4), function(err){
        console.log('Finished writing to file');
    })
}


fs.readFile('output.json', function(err, data) {
    if (err) 
        throw err;

    if (data.length) {
        results = JSON.parse(data.toString());

        //Get the IDs of the last 10 postings, so we can compare and ensure that there are no dupes
        prevIDs = results.slice(-10).map(function(obj) {
            return obj.jobID;
        });

        console.log(prevIDs);
    }

    readPage(requestURL);
})
