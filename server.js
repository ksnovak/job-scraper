var cheerio = require('cheerio'),
    url = require('url'),
    fs = require('fs'),
    request = require('request');



var requestURL = 'http://www.indeed.com/jobs?q=%22Software+Engineer%22&l=San+Diego,+ca&jt=fulltime&sort=date',
    results = [{"company": "Test company", "URL": "http://www.google.com", "jobTitle": "King in the castle", "jobID": "1337"}],
    company, jobTitle, jobURL,
    pageNum = 0,
    nextURL = "",
    prevIDs;




function readPage(requestURL) {
    pageNum++;
    console.log('On page ' + pageNum)
    request(requestURL, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);            

            $('#resultsCol > .row.result').each(function(){
                var $this = $(this);

                jobID = $this.data('jk');
                console.log('workin on id ', jobID);

                //Only add this job if it is actually new to us.
                if (!prevIDs || prevIDs.indexOf(jobID) == -1) {               

                    company = $this.find('.company').text();
                    jobURL = url.parse(requestURL).host + $this.find('a').eq(0).attr('href');
                    jobTitle = $this.find('>h2>a').attr('title');

                    var latest = {"company": company, "URL": jobURL, "jobTitle": jobTitle, "jobID": jobID};
                    results.push(latest);
                }
                else {
                    console.log('found an identical. should move onto next page...');
                    return false;
                }
            })

            var $nextLink = $('.pagination > a').last();
            if ($nextLink && pageNum < 1)  {
                nextURL = "http://" + url.parse(requestURL).host + $nextLink.attr('href') 
                readPage(nextURL);
            }
            else {
                finalize();
            }

            
        }
        else {
            console.log('got error', error)
            finalize();

        }

    })
}

function finalize() {
    fs.writeFile('output.json', JSON.stringify(results, null, 4), function(err){
        console.log('Appended some results!');
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
