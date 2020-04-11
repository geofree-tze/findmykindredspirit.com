/*

	HUGE SHOUTOUT to Brad Traversy
		the skeleton of this code was based off of his free neo4j course
			https://www.eduonix.com/courses/Web-Development/learn-to-build-apps-using-neo4j
			https://www.youtube.com/watch?v=RE2PLyFqCzE - Deploy Node.js App To Digital Ocean Server


	Medium Shoutout to Chris Courses
		he taught me how to use passport.js for the login system
			Node Authentication Tutorial with Passport.js
			https://www.youtube.com/watch?v=gYjHDMPrkWU&list=PLpPnRKq7eNW3Qm2OfoJ3Hyvf-36TulLDp


	small shoutout to Ben Awad
		he taught me how to automatically send confirmation emails using nodemailer
			https://www.youtube.com/watch?v=YU3qstG74nw - How to Send an Email in Node.js

*/


// college emails ensure one account per real person
const ACCEPTED_EMAIL_DOMAINS = 
[
"@acu.edu",
"@adelphi.edu",
"@agnesscott.edu",
"@albany.edu",
"@albion.edu",
"@alfred.edu",
"@allegheny.edu",
"@alma.edu",
"@american.edu",
"@amherst.edu",
"@anderson.edu",
"@andrews.edu",
"@anselm.edu",
"@appstate.edu",
"@apu.edu",
"@arizona.edu",
"@asbury.edu",
"@ashland.edu",
"@assumption.edu",
"@asu.edu",
"@auburn.edu",
"@augie.edu",
"@augustana.edu",
"@aurora.edu",
"@austincollege.edu",
"@babson.edu",
"@bard.edu",
"@barnard.edu",
"@baruch.cuny.edu",
"@bates.edu",
"@baylor.edu",
"@bc.edu",
"@bellarmine.edu",
"@belmont.edu",
"@beloit.edu",
"@ben.edu",
"@bennington.edu",
"@bentley.edu",
"@berea.edu",
"@berkeley.edu",
"@berklee.edu",
"@berry.edu",
"@bethel.edu",
"@bgsu.edu",
"@binghamton.edu",
"@biola.edu",
"@bloomu.edu",
"@boisestate.edu",
"@bowdoin.edu",
"@bradley.edu",
"@brandeis.edu",
"@brooklyn.cuny.edu",
"@brown.edu",
"@bryant.edu",
"@brynmawr.edu",
"@bsc.edu",
"@bsu.edu",
"@bu.edu",
"@bucknell.edu",
"@buffalo.edu",
"@butler.edu",
"@bw.edu",
"@byu.edu",
"@byui.edu",
"@calarts.edu",
"@callutheran.edu",
"@calpoly.edu",
"@calstatela.edu",
"@caltech.edu",
"@calvin.edu",
"@canisius.edu",
"@capital.edu",
"@carleton.edu",
"@carroll.edu",
"@carrollu.edu",
"@carthage.edu",
"@case.edu",
"@catawba.edu",
"@catholic.edu",
"@cbu.edu",
"@ccny.cuny.edu",
"@cedarville.edu",
"@centenary.edu",
"@central.edu",
"@centre.edu",
"@chapman.edu",
"@citadel.edu",
"@clarke.edu",
"@clarkson.edu",
"@clarku.edu",
"@clemson.edu",
"@cmc.edu",
"@cmich.edu",
"@cmu.edu",
"@cn.edu",
"@cnu.edu",
"@coa.edu",
"@coe.edu",
"@cofc.edu",
"@cofo.edu",
"@colby.edu",
"@colgate.edu",
"@collegeofidaho.edu",
"@colorado.edu",
"@coloradocollege.edu",
"@colostate.edu",
"@columbia.edu",
"@concordiacollege.edu",
"@conncoll.edu",
"@converse.edu",
"@cooper.edu",
"@cornell.edu",
"@cornellcollege.edu",
"@covenant.edu",
"@cpp.edu",
"@creighton.edu",
"@csbsju.edu",
"@csi.cuny.edu",
"@css.edu",
"@csuchico.edu",
"@csueastbay.edu",
"@csufresno.edu",
"@csulb.edu",
"@csum.edu",
"@csun.edu",
"@csuohio.edu",
"@csus.edu",
"@csusb.edu",
"@csustan.edu",
"@cwu.edu",
"@d.umn.edu",
"@dartmouth.edu",
"@davidson.edu",
"@denison.edu",
"@depaul.edu",
"@depauw.edu",
"@dickinson.edu",
"@doane.edu",
"@dordt.edu",
"@drake.edu",
"@drew.edu",
"@drexel.edu",
"@du.edu",
"@duke.edu",
"@duq.edu",
"@earlham.edu",
"@eckerd.edu",
"@ecu.edu",
"@ehc.edu",
"@eku.edu",
"@elmhurst.edu",
"@elmira.edu",
"@elon.edu",
"@emerson.edu",
"@emory.edu",
"@erau.edu",
"@esf.edu",
"@etown.edu",
"@evansville.edu",
"@fairfield.edu",
"@fandm.edu",
"@farmingdale.edu",
"@fau.edu",
"@fdu.edu",
"@fgcu.edu",
"@fisk.edu",
"@fit.edu",
"@fiu.edu",
"@flsouthern.edu",
"@student.foothill.edu",
"@fordham.edu",
"@fortlewis.edu",
"@franciscan.edu",
"@fsu.edu",
"@fullerton.edu",
"@furman.edu",
"@gatech.edu",
"@gcc.edu",
"@gcsu.edu",
"@geneseo.edu",
"@georgefox.edu",
"@georgetown.edu",
"@georgetowncollege.edu",
"@georgiasouthern.edu",
"@gettysburg.edu",
"@gmu.edu",
"@gonzaga.edu",
"@gordon.edu",
"@goshen.edu",
"@goucher.edu",
"@grinnell.edu",
"@gsu.edu",
"@guilford.edu",
"@gustavus.edu",
"@gvsu.edu",
"@gwu.edu",
"@hamilton.edu",
"@hamline.edu",
"@hampshire.edu",
"@hanover.edu",
"@hartford.edu",
"@hartwick.edu",
"@harvard.edu",
"@hastings.edu",
"@haverford.edu",
"@hendrix.edu",
"@highpoint.edu",
"@hillsdale.edu",
"@hiram.edu",
"@hmc.edu",
"@hofstra.edu",
"@hollins.edu",
"@holycross.edu",
"@home.howard.edu",
"@hood.edu",
"@hope.edu",
"@houghton.edu",
"@hsc.edu",
"@humboldt.edu",
"@hunter.cuny.edu",
"@huntington.edu",
"@hws.edu",
"@iastate.edu",
"@ic.edu",
"@iit.edu",
"@illinois.edu",
"@illinoisstate.edu",
"@immaculata.edu",
"@indiana.edu",
"@indstate.edu",
"@iona.edu",
"@ithaca.edu",
"@iup.edu",
"@iupui.edu",
"@iwu.edu",
"@jbu.edu",
"@jcu.edu",
"@jewell.edu",
"@jhu.edu",
"@jjay.cuny.edu",
"@jmu.edu",
"@juilliard.edu",
"@juniata.edu",
"@k-state.edu",
"@kent.edu",
"@kenyon.edu",
"@kettering.edu",
"@kings.edu",
"@knox.edu",
"@ku.edu",
"@kzoo.edu",
"@lafayette.edu",
"@lakeforest.edu",
"@lasalle.edu",
"@latech.edu",
"@laverne.edu",
"@lawrence.edu",
"@lclark.edu",
"@lehigh.edu",
"@lehman.cuny.edu",
"@lemoyne.edu",
"@liberty.edu",
"@linfield.edu",
"@lipscomb.edu",
"@lmu.edu",
"@louisiana.edu",
"@louisville.edu",
"@loyno.edu",
"@loyola.edu",
"@lsu.edu",
"@ltu.edu",
"@luc.edu",
"@luther.edu",
"@lvc.edu",
"@lycoming.edu",
"@lynn.edu",
"@lyon.edu",
"@macalester.edu",
"@manhattan.edu",
"@mankato.mnsu.edu",
"@manoa.hawaii.edu",
"@marietta.edu",
"@marist.edu",
"@maritime.edu",
"@marlboro.edu",
"@marquette.edu",
"@maryville.edu",
"@maryvillecollege.edu",
"@masters.edu",
"@mc.edu",
"@mcdaniel.edu",
"@memphis.edu",
"@mercer.edu",
"@meredith.edu",
"@merrimack.edu",
"@messiah.edu",
"@miami.edu",
"@miamioh.edu",
"@mica.edu",
"@middlebury.edu",
"@millersville.edu",
"@millikin.edu",
"@mills.edu",
"@millsaps.edu",
"@mines.edu",
"@missouri.edu",
"@missouristate.edu",
"@mit.edu",
"@monmouthcollege.edu",
"@montana.edu",
"@montclair.edu",
"@moravian.edu",
"@morehouse.edu",
"@morris.umn.edu",
"@mountunion.edu",
"@msmnyc.edu",
"@msmu.edu",
"@msoe.edu",
"@msstate.edu",
"@mst.edu",
"@msu.edu",
"@mtech.edu",
"@mtholyoke.edu",
"@mtsu.edu",
"@mtu.edu",
"@muhlenberg.edu",
"@murraystate.edu",
"@mville.edu",
"@nau.edu",
"@ncf.edu",
"@ncsu.edu",
"@nd.edu",
"@ndsu.edu",
"@nebrwesleyan.edu",
"@newpaltz.edu",
"@newschool.edu",
"@ngu.edu",
"@niu.edu",
"@njit.edu",
"@nku.edu",
"@nmsu.edu",
"@nmt.edu",
"@northcentralcollege.edu",
"@northeastern.edu",
"@northwestern.edu",
"@nova.edu",
"@nwciowa.edu",
"@nyu.edu",
"@oakland.edu",
"@oberlin.edu",
"@obu.edu",
"@odu.edu",
"@oglethorpe.edu",
"@ohio.edu",
"@oit.edu",
"@okbu.edu",
"@okcu.edu",
"@okstate.edu",
"@olemiss.edu",
"@onu.edu",
"@oregonstate.edu",
"@oru.edu",
"@osu.edu",
"@otterbein.edu",
"@ou.edu",
"@owu.edu",
"@oxy.edu",
"@pace.edu",
"@pacific.edu",
"@pacificu.edu",
"@pdx.edu",
"@pepperdine.edu",
"@pitt.edu",
"@pitzer.edu",
"@plu.edu",
"@pointloma.edu",
"@pomona.edu",
"@pratt.edu",
"@presby.edu",
"@princeton.edu",
"@providence.edu",
"@psu.edu",
"@pugetsound.edu",
"@purdue.edu",
"@qc.cuny.edu",
"@qu.edu",
"@queens.edu",
"@ramapo.edu",
"@randolphcollege.edu",
"@redlands.edu",
"@reed.edu",
"@regis.edu",
"@rhodes.edu",
"@ric.edu",
"@rice.edu",
"@richmond.edu",
"@rider.edu",
"@ripon.edu",
"@risd.edu",
"@rit.edu",
"@rmc.edu",
"@roanoke.edu",
"@rochester.edu",
"@rockhurst.edu",
"@rollins.edu",
"@rose-hulman.edu",
"@rowan.edu",
"@rpi.edu",
"@rutgers.edu",
"@rwu.edu",
"@sacredheart.edu",
"@sage.edu",
"@saintmarys.edu",
"@salem.edu",
"@salisbury.edu",
"@samford.edu",
"@sandiego.edu",
"@sarahlawrence.edu",
"@sbc.edu",
"@sc.edu",
"@scranton.edu",
"@scripps.edu",
"@scu.edu",
"@sdsmt.edu",
"@sdstate.edu",
"@sdsu.edu",
"@seattleu.edu",
"@sewanee.edu",
"@sfc.edu",
"@sfsu.edu",
"@shc.edu",
"@shsu.edu",
"@shu.edu",
"@siena.edu",
"@simmons.edu",
"@simpson.edu",
"@siu.edu",
"@siue.edu",
"@sjc.edu",
"@sjcny.edu",
"@sjfc.edu",
"@sjsu.edu",
"@sju.edu",
"@skidmore.edu",
"@slu.edu",
"@smcm.edu",
"@smcvt.edu",
"@smith.edu",
"@smu.edu",
"@smumn.edu",
"@snc.edu",
"@sonoma.edu",
"@southalabama.edu",
"@southeastern.edu",
"@southwestern.edu",
"@spelman.edu",
"@spu.edu",
"@stanford.edu",
"@stcloudstate.edu",
"@stedwards.edu",
"@stetson.edu",
"@stevens.edu",
"@stjohns.edu",
"@stkate.edu",
"@stlawu.edu",
"@stmarys-ca.edu",
"@stmarytx.edu",
"@stockton.edu",
"@stolaf.edu",
"@stonehill.edu",
"@stonybrook.edu",
"@stthom.edu",
"@stthomas.edu",
"@stvincent.edu",
"@suny.oneonta.edu",
"@sunymaritime.edu",
"@susqu.edu",
"@swarthmore.edu",
"@syracuse.edu",
"@tamu.edu",
"@taylor.edu",
"@tcnj.edu",
"@tcu.edu",
"@temple.edu",
"@tntech.edu",
"@touro.edu",
"@towson.edu",
"@transy.edu",
"@trincoll.edu",
"@trinity.edu",
"@truman.edu",
"@ttu.edu",
"@tufts.edu",
"@tulane.edu",
"@twu.edu",
"@txstate.edu",
"@ua.edu",
"@uaa.alaska.edu",
"@uab.edu",
"@uaf.edu",
"@uah.edu",
"@uark.edu",
"@uc.edu",
"@uccs.edu",
"@ucdavis.edu",
"@ucdenver.edu",
"@ucf.edu",
"@uchicago.edu",
"@uci.edu",
"@ucla.edu",
"@uconn.edu",
"@ucr.edu",
"@ucsb.edu",
"@ucsc.edu",
"@ucsd.edu",
"@udallas.edu",
"@udayton.edu",
"@udel.edu",
"@ufl.edu",
"@uga.edu",
"@uh.edu",
"@uic.edu",
"@uidaho.edu",
"@uiowa.edu",
"@uky.edu",
"@umaine.edu",
"@umass.edu",
"@umb.edu",
"@umbc.edu",
"@umd.edu",
"@umich.edu",
"@uml.edu",
"@umn.edu",
"@umsl.edu",
"@umt.edu",
"@umw.edu",
"@unc.edu",
"@unca.edu",
"@uncc.edu",
"@uncg.edu",
"@unco.edu",
"@uncw.edu",
"@und.edu",
"@unf.edu",
"@ung.edu",
"@unh.edu",
"@uni.edu",
"@union.edu",
"@unl.edu",
"@unlv.edu",
"@unm.edu",
"@uno.edu",
"@unomaha.edu",
"@unr.edu",
"@unt.edu",
"@unwsp.edu",
"@uoregon.edu",
"@up.edu",
"@upenn.edu",
"@uri.edu",
"@ursinus.edu",
"@usafa.edu",
"@usc.edu",
"@uscga.edu",
"@usd.edu",
"@usf.edu",
"@usfca.edu",
"@usm.edu",
"@usmma.edu",
"@usna.edu",
"@usu.edu",
"@ut.edu",
"@uta.edu",
"@utah.edu",
"@utdallas.edu",
"@utep.edu",
"@utexas.edu",
"@utk.edu",
"@utoledo.edu",
"@utrgv.edu",
"@utsa.edu",
"@utulsa.edu",
"@uu.edu",
"@uvm.edu",
"@uwb.edu",
"@uwec.edu",
"@uwf.edu",
"@uwlax.edu",
"@uwm.edu",
"@uwyo.edu",
"@valpo.edu",
"@vanderbilt.edu",
"@vanguard.edu",
"@vassar.edu",
"@vcu.edu",
"@villanova.edu",
"@virginia.edu",
"@vmi.edu",
"@vt.edu",
"@wabash.edu",
"@wagner.edu",
"@warren-wilson.edu",
"@washcoll.edu",
"@washington.edu",
"@washjeff.edu",
"@wayne.edu",
"@wcmo.edu",
"@wcupa.edu",
"@weber.edu",
"@webster.edu",
"@wellesley.edu",
"@wells.edu",
"@wesleyan.edu",
"@western.edu",
"@westminster.edu",
"@westminstercollege.edu",
"@westmont.edu",
"@westpoint.edu",
"@wfu.edu",
"@wheaton.edu",
"@wheatoncollege.edu",
"@whitman.edu",
"@whittier.edu",
"@whitworth.edu",
"@wichita.edu",
"@willamette.edu",
"@williams.edu",
"@wisc.edu",
"@wit.edu",
"@wittenberg.edu",
"@wiu.edu",
"@wku.edu",
"@wlc.edu",
"@wlu.edu",
"@wm.edu",
"@wmich.edu",
"@wofford.edu",
"@wooster.edu",
"@wpi.edu",
"@wright.edu",
"@wsu.edu",
"@wustl.edu",
"@wvu.edu",
"@wwu.edu",
"@xavier.edu",
"@yale.edu",
"@yu.edu"
];




var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');
var neo4j = require('neo4j-driver').v1;
var request = require('request');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var sessionstore = require('sessionstore');
const fs = require('fs'); // https://stackabuse.com/writing-to-files-in-node-js/

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// about.ejs carasoul imgs
var publicDir = require('path').join(__dirname, '/public');
app.use(express.static(publicDir));

// misc middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// express-session middleware with sessionstore
app.use(session({
    store: sessionstore.createSessionStore(),
    secret: EXPRESS_SESSIONSTORE_SECRET, 
    resave: false,
    saveUninitialized: false
    //cookie: { secure: true }
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

// connect-flash middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// express-validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

// neo4j middleware
var driver = neo4j.driver("bolt://"+IP_ADDRESS, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD));
var neo4j_session = driver.session();







// this code is used to backup the database
//
// How to Make a backup:
//     run the following neo4j commands
//         MATCH (u:User) RETURN u.email, u.addCount
//         MATCH (u:User)-[r:HAS]-(t:Tag) RETURN t.description, u.email ORDER BY t.description
//     save that data on some Google spreadsheet
//     note: the strings should have quotations marks around them. i included substring(1, str.length-1) in the code to account for this
//..........
// Restoring a backup:
//     uncomment this block of code
//     open putty, cd ifuckwithyou.com, pm2 restart app
//     open /backupuser /backuptag
//     paste in the data from the Google spreadsheet
//     re-comment this block of code
//     open putty, cd ifuckwithyou.com, pm2 restart app
//
//     if you backed up the users at /backupuser, then run the following neo4j commands
//         MATCH (u:User) SET u.addCount = toInteger(u.addCount)
//
// DO NOT FORGET to re-comment this block of code
// otherwise someone could access these back-door routes and start messing with the database


// Comment /* here
/*
// Backup user
app.get('/backupuser', function (req, res) {
	res.render('backupuser');
});
app.post('/backupuser', function (req, res) {
    var email = req.body.email;
    var addCount = req.body.addCount;

	var emailArr = email.split("\r\n");
	var addCountArr = addCount.split("\r\n");


	var userLength = emailArr.length;
	for (i = 0; i < userLength; i++) {
            neo4j_session
                .run("CREATE (u:User { email: {emailParam}, addCount: {addCountParam} })", { emailParam: emailArr[i].substring(1, emailArr[i].length-1), addCountParam: addCountArr[i] })
                .then(function (result) {
	                neo4j_session.close();
                })
                .catch(function (error) {
                    console.log(error);
                });
	}
});

// Backup tag
app.get('/backuptag', function (req, res) {
	res.render('backuptag');
});
app.post('/backuptag', function (req, res) {
    var email = req.body.email;
    var tag = req.body.tag;

	var emailArr = email.split("\r\n");
	var tagArr = tag.split("\r\n");


	var tagLength = emailArr.length;
	for (i = 0; i < tagLength; i++) {
            neo4j_session
		.run("MATCH (u:User) WHERE u.email={emailParam} MERGE (t:Tag {description:{tagParam}}) MERGE (u)-[:HAS]->(t)", { emailParam: emailArr[i].substring(1, emailArr[i].length-1), tagParam: tagArr[i].substring(1, tagArr[i].length-1) })
                .then(function (result) {
	                neo4j_session.close();
                })
                .catch(function (error) {
                    console.log(error);
                });
	}
});
*/
// comment */ here




// Guest List Route
app.get('/guestlist', isLoggedInMiddleware(), function (req, res) {
	res.render('guestlist', {
	    emailDomains: ACCEPTED_EMAIL_DOMAINS
	});
});




// Home Route
app.get('/', isLoggedInMiddleware(), function (req, res) {
	res.render('index', {
	    domainName: DOMAIN_NAME
	});
});

// there was a bug in the code. the first time you tried to send the invite, it did not work.
// my guess is that the web browser had to cache a cookie the 1st time.
// my workaround was to cache a cookie on the home page when they click the play button
app.post('/', function (req, res) {
	return res.json({"success": true});
});




// Email Invite page
app.get('/email', isLoggedInMiddleware(), function (req, res) {
	res.render('email', {
	    domainName: DOMAIN_NAME
	});
});

app.post('/email', function (req, res) {
    var email = req.body.email;

    // was captcha box checked?
    if(
        req.body.captcha === undefined ||
        req.body.captcha === '' ||
        req.body.captcha === null
      ){
        req.flash('danger', 'Please check the \"I\'m not a robot\" box.');
        return res.json({"success": false});
    }


    // is valid email?
    req.checkBody('email', 'Not a valid email').isEmail();
    let errors = req.validationErrors();
    if (errors) {
        req.flash('danger', 'Not a valid email.');
        return res.json({"success": false});
    }



let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();



    // is valid domain?
    var isDomainAccepted = false;
    ACCEPTED_EMAIL_DOMAINS.forEach( function(domain) {
        if (email.endsWith(domain)) {
            isDomainAccepted = true;
	    //break;
        }
    });
    if (!isDomainAccepted) {
	fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nEMAIL_DOMAIN_REJECTED", (err) => {
    		if (err) throw err;
	});
        return res.json({"success": true});
    }

    // is foothill student email a mistaken student id?
    // https://stackoverflow.com/questions/5778020/check-whether-an-input-string-contains-a-number-in-javascript
    
    if (email.endsWith("@student.foothill.edu") && /\d/.test(email)) {
        req.flash('danger', 'Your student email should look like this --> simpsonsbart@student.foothill.edu');
        return res.json({"success": false});
    }
    

    // is email too long?
    if (email.length > 100) {
        req.flash('danger', 'Your email is over 100 characters long.');
        return res.json({"success": false});
    }



    // Verify URL
    const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}&remoteip=${req.connection.remoteAddress}`;

    // Make Request To VerifyURL
    request(verifyUrl, (err, response, body) => {
        body = JSON.parse(body);

        // was captcha successful?
        if(body.success !== undefined && !body.success){
            req.flash('danger', 'Failed captcha verification. Please try again.');
            return res.json({"success": false});
        }


        // is this a new or returning user?
        neo4j_session
            .run("OPTIONAL MATCH(u:User) WHERE u.email={emailParam} RETURN u", { emailParam: email })
            .then(function (result) {
		
                if (result.records[0]._fields[0] == null) {
                        neo4j_session
                            .run("CREATE (u:User { email: {emailParam}, addCount: 0 })", { emailParam: email })
                            .then(function (result2) {
		                neo4j_session.close();
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                }


fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nEMAIL_SENT", (err) => {
    if (err) throw err;
});


                                var emailToken = jwt.sign(
                                    {
                                        email: email
                                    },
                                    EMAIL_SECRET,
                                    {
                                        expiresIn: 300, // 5 minutes = 300 seconds
                                    }
                                );

                                var confirmationURL = "https://"+DOMAIN_NAME+"/confirmation/" + emailToken;

                                // create reusable transporter object using the default SMTP transport
                                let transporter = nodemailer.createTransport({
                                    host: 'smtp.gmail.com',
                                    port: 465,
                                    secure: true, // true for 465, false for other ports
                                    auth: {
                                        user: EMAIL_ADDRESS, // generated ethereal user
                                        pass: EMAIL_ADDRESS_PASSWORD // generated ethereal password
                                    }
                                });

                                // setup email data with unicode symbols
                                let mailOptions = {
                                    from: '"Foothill icebreaker" <'+EMAIL_ADDRESS+'>', // sender address
                                    to: email, // list of receivers
                                    subject: 'Invite', // Subject line
                                    text: '', // plain text body
                                    html: 'Hello,<br><br>You requested an invite. Click here to login:<br>&lt;<a target="_blank" href="' + confirmationURL + '">' + confirmationURL.substring(0, confirmationURL.indexOf("confirmation")+12) + '</a>&gt;<br><br>'
                                };

                                // send mail with defined transport object
                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        return console.log(error);
                                    }
                                    //console.log('Message sent: %s', info.messageId);
                                    // Preview only available when sending through an Ethereal account
                                    //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                                    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                                    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                                });

		                neo4j_session.close();
                                req.flash('success', 'I sent you an email.');
                                return res.json({"success": false});
            })
            .catch(function (error) {
                console.log(error);
            });
    });
});

app.get('/confirmation/:token', isLoggedInMiddleware(), function (req, res) {
    try {
        var decoded = jwt.verify(req.params.token, EMAIL_SECRET);
	var email = decoded.email;

	let date_ob = new Date();
	let date = ("0" + date_ob.getDate()).slice(-2);
	let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
	let year = date_ob.getFullYear();
	let hours = date_ob.getHours();
	let minutes = date_ob.getMinutes();
	let seconds = date_ob.getSeconds();


	fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nLOGIN", (err) => {
	    if (err) throw err;
	});

	req.login(email, function(err) {
	    res.redirect('/find');
	});

    } catch (err) {
        res.send('<h3><br><br>For your security,<br>invitations expire 5minutes after send-time.<br><br>Please <a href="https://www.'+DOMAIN_NAME+'/email">go to Foothill icebreaker</a> and re-enter your email for a new invitation.</h3>');
    }
});




// Logout page
app.get('/logout', (req, res, next) => {
    // read the top comment by user SogMosee https://www.youtube.com/watch?v=mFVqL5aIjSE&list=PLpPnRKq7eNW3Qm2OfoJ3Hyvf-36TulLDp&index=8

let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();
fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+req.user+"\nLOGOUT", (err) => {
    if (err) throw err;
});


    req.logout();
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// Add Tag Route
app.get('/find/add_tag', authenticationMiddleware(), function (req, res) {
    res.redirect('/find');
});
app.post('/find/add_tag', authenticationMiddleware(), function (req, res) {
    var email = req.user;
    var tag = req.body.tag.trim();

    if (tag.length > 100) {
	req.flash('danger', 'Exceeds 100 characters. Please try again.');
	res.redirect('/find');
    } else {
    neo4j_session
        .run("MATCH (u:User) WHERE u.email={emailParam} SET u.addCount = u.addCount+1 RETURN u.addCount", { emailParam: email})
        .then(function (result) {
            var addCount = result.records[0]._fields[0].low;
            if (addCount > MAX_ADD_COUNT) {
                neo4j_session.close();
//                req.flash('danger', 'Your account is under review.');
                res.redirect('/find');
            }
            else {
                neo4j_session
                    .run("MATCH (u:User) WHERE u.email={emailParam} MERGE (t:Tag {description:{tagParam}}) MERGE (u)-[:HAS]->(t)", { emailParam: email, tagParam: tag })
                    .then(function (result2) {

let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();
fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nADD_TAG\n"+tag, (err) => {
    if (err) throw err;
});

                        neo4j_session.close();
                        res.redirect('/find#'+tag);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    }
});




// Remove Tag Route
app.get('/find/remove_tag', authenticationMiddleware(), function (req, res) {
    res.redirect('/find');
});
app.post('/find/remove_tag', authenticationMiddleware(), function (req, res) {
    var email = req.user;
    var tag = req.body.tag;

//https://usefulangle.com/post/187/nodejs-get-date-time

let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();
fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nREMOVE_TAG\n"+tag, (err) => {
    if (err) throw err;
});


    neo4j_session
        .run("MATCH (u:User)-[r:HAS]->(t:Tag {description: {tagParam}}) WHERE u.email={emailParam} DELETE r", { tagParam: tag, emailParam: email })
        .then(function (result) {
            neo4j_session.close();
//	    req.flash('danger', 'Peeping Toms are frowned upon.');
            res.redirect('/find#'+tag);
        })
        .catch(function (error) {
            console.log(error);
        });
});




// All Schools Route
app.get('/find/all_schools', authenticationMiddleware(), function (req, res) {
    res.redirect('/find');
});
app.post('/find/all_schools', authenticationMiddleware(), function (req, res) {
    var email = req.user;
    var allSchools = (req.body.allSchools == 'true'); // https://stackoverflow.com/questions/263965/how-can-i-convert-a-string-to-boolean-in-javascript


let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();
fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nALL_SCHOOLS\n"+allSchools, (err) => {
    if (err) throw err;
});


    neo4j_session
        .run("MATCH (u:User) WHERE u.email={emailParam} SET u.allSchools={allSchoolsParam}", { emailParam: email, allSchoolsParam: allSchools })
        .then(function (result) {
            neo4j_session.close();
            res.redirect('/find');
        })
        .catch(function (error) {
            console.log(error);
        });
});




// Profile Route
app.get('/find', authenticationMiddleware(), function (req, res) {
    var email = req.user;

    neo4j_session
        .run("MATCH(u:User) WHERE u.email={emailParam} RETURN u.addCount, u.allSchools", {emailParam: email})
        .then(function(result){
            var addCount = result.records[0]._fields[0].low;
            var allSchools = result.records[0]._fields[1];

	    if (addCount > MAX_ADD_COUNT) {
		neo4j_session.close();

		res.render('find', {
		    frozen: true
		});
	    }
	    else {

            neo4j_session
                .run("OPTIONAL MATCH (u:User)-[r:HAS]->(t:Tag) WHERE u.email={emailParam} RETURN t", {emailParam: email})
                .then(function(result2){
                    var tagArr = [];

                    result2.records.forEach(function (record) {
                        if (record._fields[0] != null) {
                            tagArr.push(record._fields[0].properties);
                        }
                    });


if (allSchools) {

                    neo4j_session
                        .run("OPTIONAL MATCH (u:User)-[r1:HAS]->(commonTag)<-[r2:HAS]-(kindredSpirit:User) WHERE u.email={emailParam} RETURN kindredSpirit.email, commonTag.description", {emailParam: email})
                        .then(function (result3) {
                            var unsortedKindredArr = [];

                            result3.records.forEach(function (record) {
                                if (record._fields[0] != null) {
                                    //console.log(record._fields);
                                    var kindredEmail = record._fields[0];
                                    var kindredTag = record._fields[1];

                                    unsortedKindredArr.push({ email: kindredEmail, tag: kindredTag });
                                }
                            });



                            // https://stackoverflow.com/questions/53308478/parse-data-into-json
                            var sortedKindredArr = unsortedKindredArr.reduce((all, record) => {
                                var user = all.find(u => u.email === record.email);
                                //If already exists person now contains existing person
                                if (user) {
                                    user.tags.push(record.tag);
                                    //add new interest
                                } else all.push({
                                    email: record.email,
                                    tags: [record.tag]
                                    //creates new person object
                                });

                                return all;
                            }, []).sort((a, b) => b.tags.length - a.tags.length);
                            //sorts based on length of interest array

                            //console.log(sortedKindredArr);
                            while (sortedKindredArr.length > MAX_MATCH_COUNT) {
                                sortedKindredArr.pop();
                            }

                            //console.log(sortedKindredArr);
                            //console.log(sortedKindredArr.length);


			    neo4j_session
			        .run("MATCH (u:User)-[r:HAS]->(t:Tag) RETURN t, COUNT(r), t.description ORDER BY toUpper(t.description)")
//			        .run("MATCH (u:User)-[r:HAS]->(t:Tag) RETURN DISTINCT t.description ORDER BY toUpper(t.description)")
			        .then(function (result4) {
			            var tagArrAll = [];
			            result4.records.forEach(function (record) {
			                tagArrAll.push({
//			                    description: record._fields[0]
			                    description: record._fields[0].properties.description,
			                    count: record._fields[1].low
			                });
			            });
 
	                            neo4j_session.close();

	                            res.render('find', {
	                                frozen: false,
	                                searchAllSchools: allSchools,
	                                tags: tagArr,
         	                        kindred: sortedKindredArr,
                	                tagsAll: tagArrAll
                        	    });

			        })
			        .catch(function (error) {
        			    console.log(error);
			        });
                        })
		        .catch(function (error) {
        		    console.log(error);
		        });
} else {

                    neo4j_session
			.run("OPTIONAL MATCH (u:User)-[r1:HAS]->(commonTag)<-[r2:HAS]-(kindredSpirit:User) WHERE u.email={emailParam} AND kindredSpirit.email ENDS WITH {emailDomainParam} RETURN kindredSpirit.email, commonTag.description", {emailParam: email, emailDomainParam: email.substring(email.indexOf('@'))})
                        .then(function (result3) {
                            var unsortedKindredArr = [];

                            result3.records.forEach(function (record) {
                                if (record._fields[0] != null) {
                                    //console.log(record._fields);
                                    var kindredEmail = record._fields[0];
                                    var kindredTag = record._fields[1];

                                    unsortedKindredArr.push({ email: kindredEmail, tag: kindredTag });
                                }
                            });



                            // https://stackoverflow.com/questions/53308478/parse-data-into-json
                            var sortedKindredArr = unsortedKindredArr.reduce((all, record) => {
                                var user = all.find(u => u.email === record.email);
                                //If already exists person now contains existing person
                                if (user) {
                                    user.tags.push(record.tag);
                                    //add new interest
                                } else all.push({
                                    email: record.email,
                                    tags: [record.tag]
                                    //creates new person object
                                });

                                return all;
                            }, []).sort((a, b) => b.tags.length - a.tags.length);
                            //sorts based on length of interest array

                            //console.log(sortedKindredArr);
                            while (sortedKindredArr.length > MAX_MATCH_COUNT) {
                                sortedKindredArr.pop();
                            }

                            //console.log(sortedKindredArr);
                            //console.log(sortedKindredArr.length);


			    neo4j_session
			        .run("MATCH (u:User)-[r:HAS]->(t:Tag) WHERE u.email ENDS WITH {emailDomainParam} RETURN t, COUNT(r), t.description ORDER BY toUpper(t.description)", {emailDomainParam: email.substring(email.indexOf('@'))})
//			        .run("MATCH (u:User)-[r:HAS]->(t:Tag) WHERE u.email ENDS WITH {emailDomainParam} RETURN DISTINCT t.description ORDER BY toUpper(t.description)", {emailDomainParam: email.substring(email.indexOf('@'))})
			        .then(function (result4) {
			            var tagArrAll = [];
			            result4.records.forEach(function (record) {
			                tagArrAll.push({
//			                    description: record._fields[0]
			                    description: record._fields[0].properties.description,
			                    count: record._fields[1].low
			                });
			            });
 
	                            neo4j_session.close();

	                            res.render('find', {
	                                frozen: false,
	                                searchAllSchools: allSchools,
	                                tags: tagArr,
         	                        kindred: sortedKindredArr,
                	                tagsAll: tagArrAll
                        	    });

			        })
			        .catch(function (error) {
        			    console.log(error);
			        });
                        })
		        .catch(function (error) {
        		    console.log(error);
		        });


}
		})
		.catch(function (error) {
		    console.log(error);
                });
	    }
	})
	.catch(function (error) {
	    console.log(error);
        });
});

app.listen(5000);

console.log('Server started on port 5000');

passport.serializeUser(function(email, done) {
    done(null, email);
});

passport.deserializeUser(function(email, done) {
    done(null, email);
});

function authenticationMiddleware() {
	return (req, res, next) => {

        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/email');
        }
	}
}

function isLoggedInMiddleware() {
	return (req, res, next) => {

        if (req.isAuthenticated()) {
            res.redirect('/find');
        } else {
            return next();
        }
	}
}

module.exports = app;
