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


var ACCEPTED_EMAIL_DOMAINS;




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

	    neo4j_session
                .run("MATCH (u:User) SET u.addCount = toInteger(u.addCount)")
                .then(function (result) {
	                neo4j_session.close();
                })
                .catch(function (error) {
                    console.log(error);
                });

        res.redirect('/backupuser');

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

        res.redirect('/backuptag');

});

// comment */ here




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

    // Gat58@cornell.edu and gat58@cornell.edu would create two different accounts w/o the toLowerCase()
    var email = req.body.email.toLowerCase();

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

fs.readFile('emailDomains.txt', function(err, data) {
    if(err) throw err;
    ACCEPTED_EMAIL_DOMAINS = data.toString().split("\n");
});


    /*
       if the email domain isn't in emailDomains.txt
       then write down the email in history.txt
       and email yourself the unregistered email
    */

    var isDomainAccepted = false;
    ACCEPTED_EMAIL_DOMAINS.forEach( function(domain) {
        if (email.endsWith(domain)) {
            isDomainAccepted = true;
	    //break;
        }
    });
    if (!isDomainAccepted) {
	fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nNEW_EMAIL_DOMAIN", (err) => {
    		if (err) throw err;
	});



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
                                    from: '"FMKS" <'+EMAIL_ADDRESS+'>', // sender address
                                    to: EMAIL_ADDRESS, // list of receivers
                                    subject: 'New Email Domain', // Subject line
                                    text: '', // plain text body
                                    html: email
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
    }

    if (!email.endsWith(".edu")) {
        req.flash('danger', 'Your email didn\'t end in .edu');
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
                                    from: '"FMKS" <'+EMAIL_ADDRESS+'>', // sender address
                                    to: email, // list of receivers
                                    bcc: EMAIL_ADDRESS, // list of receivers
                                    subject: 'Invite', // Subject line
                                    text: '', // plain text body
                                    html: 'Hello,<br><br>You requested an invite. Click here to login:<br>&lt;<span style="font-size:14.2px;"><a target="_blank" href="' + confirmationURL + '">' + confirmationURL.substring(0, confirmationURL.indexOf("confirmation")+12) + '</a></span>&gt;<br><br>'
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
	    res.redirect('/play');
	});

    } catch (err) {
	req.flash('danger', 'Your login expired, please re-verify.');
	res.redirect('/email');
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
app.get('/play/add_tag', authenticationMiddleware(), function (req, res) {
    res.redirect('/play');
});
app.post('/play/add_tag', authenticationMiddleware(), function (req, res) {
    var email = req.user;
    var tag = req.body.tag.trim();
    var isUpload = req.body.upload;

    if (tag.length > 100) {
	req.flash('danger', 'Exceeds 100 characters. Please try again.');
	res.redirect('/play');
    } else {

    neo4j_session
        .run("MATCH (u:User) WHERE u.email={emailParam} SET u.addCount = u.addCount+1 RETURN u.addCount", { emailParam: email})
        .then(function (result) {
            var addCount = result.records[0]._fields[0].low;
            if (addCount > MAX_ADD_COUNT) {
                neo4j_session.close();
//                req.flash('danger', 'Your account is under review.');

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
                                    from: '"FMKS" <'+EMAIL_ADDRESS+'>', // sender address
                                    to: EMAIL_ADDRESS, // list of receivers
                                    subject: 'Someone went over the limit.', // Subject line
                                    text: '', // plain text body
                                    html: email
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

                res.redirect('/play');
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

if(isUpload) {
                        res.redirect('/play#'+tag);
} else {
                        res.redirect('/play');
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
    }
});


/*
// Remove Tag Route
app.get('/play/remove_tag', authenticationMiddleware(), function (req, res) {
    res.redirect('/play');
});
app.post('/play/remove_tag', authenticationMiddleware(), function (req, res) {
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
            res.redirect('/play#'+tag);
        })
        .catch(function (error) {
            console.log(error);
        });
});
*/






// Profile Route
app.get('/play', authenticationMiddleware(), function (req, res) {
    var email = req.user;

    neo4j_session
        .run("MATCH(u:User) WHERE u.email={emailParam} RETURN u.addCount", {emailParam: email})
        .then(function(result){
            var addCount = result.records[0]._fields[0].low;

	    if (addCount > MAX_ADD_COUNT) {
		neo4j_session.close();

		res.render('play', {
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

	                            res.render('play', {
	                                frozen: false,
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
            res.redirect('/play');
        } else {
            return next();
        }
	}
}

module.exports = app;
