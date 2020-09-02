/*

	HUGE SHOUTOUT to Brad Traversy
		the skeleton of this code was based on Brad's free neo4j course
			https://www.eduonix.com/courses/Web-Development/learn-to-build-apps-using-neo4j
			https://www.youtube.com/watch?v=RE2PLyFqCzE - Deploy Node.js App To Digital Ocean Server


	Medium Shoutout to Chris Courses
		Chris taught me how to use passport.js for the login system
			Node Authentication Tutorial with Passport.js
			https://www.youtube.com/watch?v=gYjHDMPrkWU&list=PLpPnRKq7eNW3Qm2OfoJ3Hyvf-36TulLDp


	small shoutout to Ben Awad
		Ben taught me how to automatically send confirmation emails using nodemailer
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
//     open /backupuser /backuptag
//     paste in the data from the Google spreadsheet
//     type the password hit enter
//


// Backup user
app.get('/backupuser', isAdmin(), function (req, res) {
	res.render('backupuser');
});
app.post('/backupuser', function (req, res) {
    var email = req.body.email;
    var addCount = req.body.addCount;
    var addFriendCount = req.body.addFriendCount;
    var password = req.body.password;

    if (password.localeCompare(BACKUP_PASSWORD) == 0) {

	var emailArr = email.split("\r\n");
	var addCountArr = addCount.split("\r\n");
	var addFriendCountArr = addFriendCount.split("\r\n");


	var userLength = emailArr.length;
	for (i = 0; i < userLength; i++) {
            neo4j_session
                .run("CREATE (u:User { email: {emailParam}, addCount: {addCountParam}, addFriendCount: {addFriendCountParam}, allSchools: true, currentIndex: false, matchIndex: false, statementQuery: '' })", { emailParam: emailArr[i].substring(1, emailArr[i].length-1), addCountParam: addCountArr[i] , addFriendCountParam: addFriendCountArr[i] })
                .then(function (result) {
	                neo4j_session.close();
                })
                .catch(function (error) {
                    console.log(error);
                });
	}

            neo4j_session
                .run("MATCH (u:User) SET u.addCount = toInteger(u.addCount), u.addFriendCount = toInteger(u.addFriendCount)")
                .then(function (result) {
	                neo4j_session.close();
                })
                .catch(function (error) {
                    console.log(error);
                });

	res.redirect('/backupuser');

    } else {
	res.send('incorrect password');
    }

});

// Backup tag
app.get('/backuptag', isAdmin(), function (req, res) {
	res.render('backuptag');
});
app.post('/backuptag', function (req, res) {
    var email = req.body.email;
    var tag = req.body.tag;
    var password = req.body.password;

    if (password.localeCompare(BACKUP_PASSWORD) == 0) {

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

    } else {
	res.send('incorrect password');
    }

});




// Backup relationships
app.get('/backuprelationships', isAdmin(), function (req, res) {
	res.render('backuprelationships');
});
app.post('/backuprelationships', function (req, res) {
    var email1 = req.body.email1;
    var relationshipType = req.body.relationshipType;
    var email2 = req.body.email2;
    var password = req.body.password;

    if (password.localeCompare(BACKUP_PASSWORD) == 0) {

	var email1Arr = email1.split("\r\n");
	var relationshipTypeArr = relationshipType.split("\r\n");
	var email2Arr = email2.split("\r\n");


	var listLength = email1Arr.length;
	for (i = 0; i < listLength; i++) {
	    if (relationshipTypeArr[i].localeCompare("\"SENT\"") == 0) {
            neo4j_session
		.run("MATCH (u:User),(v:User) WHERE u.email={email1Param} AND v.email={email2Param} MERGE (u)-[:SENT]->(v)", { email1Param: email1Arr[i].substring(1, email1Arr[i].length-1),  email2Param: email2Arr[i].substring(1, email2Arr[i].length-1) })
                .then(function (result) {
	                neo4j_session.close();
                })
                .catch(function (error) {
                    console.log(error);
                });
	    }
	    else if (relationshipTypeArr[i].localeCompare("\"FRIENDS\"") == 0) {
            neo4j_session
		.run("MATCH (u:User),(v:User) WHERE u.email={email1Param} AND v.email={email2Param} MERGE (u)-[:FRIENDS]-(v)", { email1Param: email1Arr[i].substring(1, email1Arr[i].length-1),  email2Param: email2Arr[i].substring(1, email2Arr[i].length-1) })
                .then(function (result) {
	                neo4j_session.close();
                })
                .catch(function (error) {
                    console.log(error);
                });
	    }
	    else if (relationshipTypeArr[i].localeCompare("\"IDFWU\"") == 0) {
            neo4j_session
		.run("MATCH (u:User),(v:User) WHERE u.email={email1Param} AND v.email={email2Param} MERGE (u)-[:IDFWU]-(v)", { email1Param: email1Arr[i].substring(1, email1Arr[i].length-1),  email2Param: email2Arr[i].substring(1, email2Arr[i].length-1) })
                .then(function (result) {
	                neo4j_session.close();
                })
                .catch(function (error) {
                    console.log(error);
                });
	    }
	}

	res.redirect('/backuprelationships');

    } else {
	res.send('incorrect password');
    }

});






// Frozen Route
app.get('/frozen', function (req, res) {
	res.render('frozen');
});


// About Route
app.get('/about', function (req, res) {
	res.render('about');
});


// Invited Route
app.get('/invite_sent', isLoggedInMiddleware(), function (req, res) {
	res.render('invite_sent');
});




// Home Route
app.get('/', isLoggedInMiddleware(), function (req, res) {
	res.render('index', {
	    domainName: DOMAIN_NAME
	});
});

app.post('/', function (req, res) {

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
	fs.appendFile('emailDomains.txt', '\n'+email.substring(email.indexOf("@")), (err) => {
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
                                    from: '"Tinder for friends" <'+EMAIL_ADDRESS+'>', // sender address
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

    // https://stackoverflow.com/questions/8885052/regular-expression-to-validate-email-ending-in-edu
    // https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_regexp_test2
    // .edu
    var patt = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.+-]+\.edu$");
    // .edu.XX
    var patt2 = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.+-]+\.edu\.[a-zA-Z0-9.+-]+$");
    // .ac.XX
    var patt3 = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.+-]+\.ac\.[a-zA-Z0-9.+-]+$");
  

    if (!(patt.test(email) || (patt2.test(email) || patt3.test(email)))) {
        req.flash('danger', 'Your email didn\'t end in .edu or .edu.XX or .ac.XX');
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
                            .run("CREATE (u:User { email: {emailParam}, addCount: 0, addFriendCount: 0, allSchools: true, currentIndex: false, matchIndex: false, statementQuery: '' })", { emailParam: email })
                            .then(function (result2) {
		                neo4j_session.close();
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                }


fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nLOGIN_EMAIL_SENT", (err) => {
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
                                    from: '"Tinder for friends" <'+EMAIL_ADDRESS+'>', // sender address
                                    to: email, // list of receivers
                                    bcc: EMAIL_ADDRESS, // list of receivers
                                    subject: 'Tinder for friends', // Subject line
                                    text: '', // plain text body
                                    html: 'Hello,<br><br>You entered your email address on Tinder for friends.<br><br>Click here to login:<br>&lt;<a target="_blank" href="' + confirmationURL + '">' + confirmationURL.substring(0, confirmationURL.indexOf("confirmation")+12) + '</a>&gt;<br><br><span style="font-size:10px;">P.S. that link will expire in 5 minutes for security reasons.<br>You can always get a new login link by re-entering your email at <a href="https://tinderforfriends.com/" target="_blank">Tinder for friends</a></span><br><br>'
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
//                                req.flash('success', 'I sent you an email.');
                                return res.json({"success": true});
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

	if (decoded.friendRequestAccepted) {
		fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nFRIEND_REQUEST_ACCEPTED_EMAIL_OPENED", (err) => {
		    if (err) throw err;
		});

		req.login(email, function(err) {
		    res.redirect('/friends');
		});
	} else {
		fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nLOGIN", (err) => {
		    if (err) throw err;
		});

		req.login(email, function(err) {
		    res.redirect('/search');
		});
	}


    } catch (err) {
//	req.flash('danger', 'Your login expired, please re-verify.');
	res.send('Sorry, invalid or expired token. Please <a href="/#start">go back</a> and enter your email address again.');
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




// Search Add Tag Route
app.get('/search/add_tag', authenticationMiddleware(), function (req, res) {
    res.redirect('/search');
});
app.post('/search/add_tag', authenticationMiddleware(), function (req, res) {
    var email = req.user;
    var tag = req.body.tag.trim();

    if (tag.length > 100) {
	req.flash('danger', 'Exceeds 100 characters. Please try again.');
	res.redirect('/search');
    } else {

    neo4j_session
        .run("MATCH (u:User) WHERE u.email={emailParam} SET u.addCount = u.addCount+1 RETURN u.addCount", { emailParam: email})
        .then(function (result) {
            var addCount = result.records[0]._fields[0].low;
            if (addCount > MAX_ADD_COUNT) {


let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();
fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nQUIRK_LIMIT_EXCEEDED", (err) => {
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
                                    from: '"Tinder for friends" <'+EMAIL_ADDRESS+'>', // sender address
                                    to: EMAIL_ADDRESS, // list of receivers
                                    subject: email + ' went over the quirk limit.', // Subject line
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

                neo4j_session.close();
                req.flash('danger', 'Please wait a few minutes before you add any more quirks.');
                res.redirect('/search');
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

	                neo4j_session
        	            .run("MATCH (u:User) WHERE u.email={emailParam} SET u.currentIndex = {tagParam}", { emailParam: email, tagParam: tag })
                	    .then(function (result3) {


               		        neo4j_session.close();

				res.redirect('/search');

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
});







// Search Remove Tag Route
app.get('/search/remove_tag', authenticationMiddleware(), function (req, res) {
    res.redirect('/search');
});
app.post('/search/remove_tag', authenticationMiddleware(), function (req, res) {
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
    .run("MATCH(u:User) WHERE u.email={emailParam} RETURN u.allSchools", {emailParam: email})
    .then(function (result) {
	var allSchools = result.records[0]._fields[0];


    neo4j_session
        .run("MATCH (u:User)-[r:HAS]->(t:Tag {description: {tagParam}}) WHERE u.email={emailParam} DELETE r", { tagParam: tag, emailParam: email })
        .then(function (result1) {


if (allSchools) {

	    neo4j_session
	        .run("MATCH(t:Tag)-[r]-() WHERE t.description={tagParam} RETURN COUNT(r)", {tagParam: tag})
        	.then(function (result2) {

	            var relationshipCount = result2.records[0]._fields[0].low;


		    if (relationshipCount == 0) {
			    neo4j_session
			        .run("MATCH(u:User) WHERE u.email={emailParam} SET u.currentIndex = false", {emailParam: email})
        			.then(function (result3) {

		        	    neo4j_session.close();
        			    res.redirect('/search');

			        })
        			.catch(function (error) {
        			    console.log(error);
        			});
		    } else {
			    neo4j_session
			        .run("MATCH (u:User) WHERE u.email={emailParam} SET u.currentIndex={tagParam}", { emailParam: email, tagParam: tag })
        			.then(function (result4) {

		        	    neo4j_session.close();
//				    req.flash('danger', 'are you a Peeping Tom?');
        			    res.redirect('/search');

			        })
        			.catch(function (error) {
        			    console.log(error);
        			});
		    }
	        })
        	.catch(function (error) {
        	    console.log(error);
        	});
} else {
	    neo4j_session
	        .run("MATCH(t:Tag)-[r:HAS]-(u:User) WHERE t.description={tagParam} AND u.email ENDS WITH {emailDomainParam} RETURN COUNT(r)", {tagParam: tag, emailDomainParam: email.substring(email.indexOf('@'))})
        	.then(function (result5) {

	            var relationshipCount = result5.records[0]._fields[0].low;


		    if (relationshipCount == 0) {
			    neo4j_session
			        .run("MATCH(u:User) WHERE u.email={emailParam} SET u.currentIndex = false", {emailParam: email})
        			.then(function (result6) {

		        	    neo4j_session.close();
        			    res.redirect('/search');

			        })
        			.catch(function (error) {
        			    console.log(error);
        			});
		    } else {
			    neo4j_session
			        .run("MATCH (u:User) WHERE u.email={emailParam} SET u.currentIndex={tagParam}", { emailParam: email, tagParam: tag })
        			.then(function (result7) {

		        	    neo4j_session.close();
//				    req.flash('danger', 'are you a Peeping Tom?');
        			    res.redirect('/search');

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
    })
    .catch(function (error) {
	console.log(error);
    });
});



// All Schools Route
app.get('/play/all_schools', authenticationMiddleware(), function (req, res) {
    res.redirect('/play');
});
app.post('/play/all_schools', authenticationMiddleware(), function (req, res) {
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
        .run("MATCH (u:User) WHERE u.email={emailParam} SET u.allSchools={allSchoolsParam}, u.currentIndex=false, u.statementQuery=''", { emailParam: email, allSchoolsParam: allSchools })
        .then(function (result) {
            neo4j_session.close();
            res.redirect('/play');
        })
        .catch(function (error) {
            console.log(error);
        });
});



// Search Query Route
app.get('/search/query', authenticationMiddleware(), function (req, res) {
    res.redirect('/search');
});
app.post('/search/query', authenticationMiddleware(), function (req, res) {
    var email = req.user;
    var statementQuery = req.body.statementQuery;

    if (statementQuery.length > 100) {
	req.flash('danger', 'Exceeds 100 characters. Please try again.');
	res.redirect('/search');
    }


let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();
fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nSEARCH\n"+statementQuery, (err) => {
    if (err) throw err;
});


    neo4j_session
        .run("MATCH (u:User) WHERE u.email={emailParam} SET u.statementQuery={statementQueryParam}, u.currentIndex=false", { emailParam: email, statementQueryParam: statementQuery })
        .then(function (result) {
            neo4j_session.close();
            res.redirect('/search');
        })
        .catch(function (error) {
            console.log(error);
        });
});








// Friends To Be Route
app.get('/friendstobe', authenticationMiddleware(), function (req, res) {
    var email = req.user;


	neo4j_session
	    .run("OPTIONAL MATCH (u:User)-[:HAS]-(commonTag:Tag)-[:HAS]-(kindredSpirit:User) WHERE NOT (kindredSpirit:User)-[]-(u:User) AND u.email={emailParam} RETURN COUNT(DISTINCT(kindredSpirit))", {emailParam: email})
            .then(function (result) {
		var friendsToBeCount = result.records[0]._fields[0];


	neo4j_session
	    .run("OPTIONAL MATCH (u:User)-[:HAS]-(commonTag:Tag)-[:HAS]-(kindredSpirit:User) WHERE (kindredSpirit:User)-[:SENT]->(u:User) AND u.email={emailParam} RETURN COUNT(DISTINCT(kindredSpirit))", {emailParam: email})
            .then(function (result2) {
		var friendRequestsCount = result2.records[0]._fields[0];


	neo4j_session
	    .run("OPTIONAL MATCH (u:User)-[:HAS]-(commonTag:Tag)-[:HAS]-(kindredSpirit:User) WHERE (kindredSpirit:User)-[:FRIENDS]-(u:User) AND u.email={emailParam} RETURN COUNT(DISTINCT(kindredSpirit))", {emailParam: email})
            .then(function (result3) {
		var friendsCount = result3.records[0]._fields[0];




                    neo4j_session
                        .run("OPTIONAL MATCH (u:User)-[:HAS]-(commonTag:Tag)-[:HAS]-(kindredSpirit:User) WHERE NOT (kindredSpirit:User)-[]-(u:User) AND u.email={emailParam} RETURN ID(kindredSpirit), commonTag.description ORDER BY ID(kindredSpirit)", {emailParam: email})
                        .then(function (result4) {
                            var unsortedKindredArr = [];

                            result4.records.forEach(function (record) {
                                if (record._fields[0] != null) {
                                    //console.log(record._fields);
                                    var kindredEmail = record._fields[0].toString();
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



				neo4j_session.close();

				res.render('friendstobe', {
       	        		    friendsToBe: friendsToBeCount,
		       	            friendRequests: friendRequestsCount,
       	        		    friends: friendsCount,
				    kindred: sortedKindredArr
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
	    })
	    .catch(function (error) {
	        console.log(error);
	    });
});





// Friends Requests Route
app.get('/friendrequests', authenticationMiddleware(), function (req, res) {
    var email = req.user;


	neo4j_session
	    .run("OPTIONAL MATCH (u:User)-[:HAS]-(commonTag:Tag)-[:HAS]-(kindredSpirit:User) WHERE NOT (kindredSpirit:User)-[]-(u:User) AND u.email={emailParam} RETURN COUNT(DISTINCT(kindredSpirit))", {emailParam: email})
            .then(function (result) {
		var friendsToBeCount = result.records[0]._fields[0];


	neo4j_session
	    .run("OPTIONAL MATCH (u:User)-[:HAS]-(commonTag:Tag)-[:HAS]-(kindredSpirit:User) WHERE (kindredSpirit:User)-[:SENT]->(u:User) AND u.email={emailParam} RETURN COUNT(DISTINCT(kindredSpirit))", {emailParam: email})
            .then(function (result2) {
		var friendRequestsCount = result2.records[0]._fields[0];


	neo4j_session
	    .run("OPTIONAL MATCH (u:User)-[:HAS]-(commonTag:Tag)-[:HAS]-(kindredSpirit:User) WHERE (kindredSpirit:User)-[:FRIENDS]-(u:User) AND u.email={emailParam} RETURN COUNT(DISTINCT(kindredSpirit))", {emailParam: email})
            .then(function (result3) {
		var friendsCount = result3.records[0]._fields[0];




                    neo4j_session
			.run("OPTIONAL MATCH (u:User)-[:HAS]-(commonTag:Tag)-[:HAS]-(kindredSpirit:User) WHERE (kindredSpirit:User)-[:SENT]->(u:User) AND u.email={emailParam} RETURN ID(kindredSpirit), commonTag.description ORDER BY ID(kindredSpirit)", {emailParam: email})
                        .then(function (result4) {
                            var unsortedKindredArr = [];

                            result4.records.forEach(function (record) {
                                if (record._fields[0] != null) {
                                    //console.log(record._fields);
                                    var kindredEmail = record._fields[0].toString();
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



				neo4j_session.close();

				res.render('friendrequests', {
       	        		    friendsToBe: friendsToBeCount,
		       	            friendRequests: friendRequestsCount,
       	        		    friends: friendsCount,
				    kindred: sortedKindredArr
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
	    })
	    .catch(function (error) {
	        console.log(error);
	    });
});





// Friends Route
app.get('/friends', authenticationMiddleware(), function (req, res) {
    var email = req.user;


	neo4j_session
	    .run("OPTIONAL MATCH (u:User)-[:HAS]-(commonTag:Tag)-[:HAS]-(kindredSpirit:User) WHERE NOT (kindredSpirit:User)-[]-(u:User) AND u.email={emailParam} RETURN COUNT(DISTINCT(kindredSpirit))", {emailParam: email})
            .then(function (result) {
		var friendsToBeCount = result.records[0]._fields[0];


	neo4j_session
	    .run("OPTIONAL MATCH (u:User)-[:HAS]-(commonTag:Tag)-[:HAS]-(kindredSpirit:User) WHERE (kindredSpirit:User)-[:SENT]->(u:User) AND u.email={emailParam} RETURN COUNT(DISTINCT(kindredSpirit))", {emailParam: email})
            .then(function (result2) {
		var friendRequestsCount = result2.records[0]._fields[0];


	neo4j_session
	    .run("OPTIONAL MATCH (u:User)-[:HAS]-(commonTag:Tag)-[:HAS]-(kindredSpirit:User) WHERE (kindredSpirit:User)-[:FRIENDS]-(u:User) AND u.email={emailParam} RETURN COUNT(DISTINCT(kindredSpirit))", {emailParam: email})
            .then(function (result3) {
		var friendsCount = result3.records[0]._fields[0];




                    neo4j_session
			.run("OPTIONAL MATCH (u:User)-[:HAS]-(commonTag:Tag)-[:HAS]-(kindredSpirit:User) WHERE (kindredSpirit:User)-[:FRIENDS]-(u:User) AND u.email={emailParam} RETURN kindredSpirit.email, commonTag.description ORDER BY kindredSpirit.email", {emailParam: email})
                        .then(function (result4) {
                            var unsortedKindredArr = [];

                            result4.records.forEach(function (record) {
                                if (record._fields[0] != null) {
                                    //console.log(record._fields);
                                    var kindredEmail = record._fields[0].toString();
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



				neo4j_session.close();

				res.render('friends', {
       	        		    friendsToBe: friendsToBeCount,
		       	            friendRequests: friendRequestsCount,
       	        		    friends: friendsCount,
				    kindred: sortedKindredArr,
				    test: email
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
	    })
	    .catch(function (error) {
	        console.log(error);
	    });
});





// Search Route
app.get('/search', authenticationMiddleware(), function (req, res) {
    var email = req.user;

    neo4j_session
        .run("MATCH(u:User) WHERE u.email={emailParam} RETURN u.addCount, u.allSchools, u.currentIndex, u.statementQuery", {emailParam: email})
        .then(function(result){
            var addCount = result.records[0]._fields[0].low;
            var allSchools = result.records[0]._fields[1];
            var currentIndex = result.records[0]._fields[2];
            var statementQuery = result.records[0]._fields[3];


	    if (statementQuery === "") {

	                            neo4j_session.close();

	                            res.render('search', {
					query: "",
					statementIndex: currentIndex,
	                                searchAllSchools: allSchools,
	                                tags: {},
                	                tagsAll: {}
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
			        .run("MATCH (u:User)-[r:HAS]->(t:Tag) WHERE toLower(t.description) CONTAINS toLower({statementQueryParam}) RETURN t, COUNT(r), t.description ORDER BY toUpper(t.description) LIMIT 10", {statementQueryParam: statementQuery})
//			        .run("MATCH (u:User)-[r:HAS]->(t:Tag) RETURN t, COUNT(r), t.description ORDER BY toUpper(t.description)")
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

	                            res.render('search', {
					query: statementQuery,
					statementIndex: currentIndex,
	                                searchAllSchools: allSchools,
	                                tags: tagArr,
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
});



// Profile Route
app.get('/profile', authenticationMiddleware(), function (req, res) {
    var email = req.user;

    neo4j_session
        .run("MATCH(u:User) WHERE u.email={emailParam} RETURN u.addCount, u.allSchools", {emailParam: email})
        .then(function(result){
            var addCount = result.records[0]._fields[0].low;
            var allSchools = result.records[0]._fields[1];


            neo4j_session
                .run("OPTIONAL MATCH (u:User)-[r:HAS]->(t:Tag) WHERE u.email={emailParam} RETURN t", {emailParam: email})
                .then(function(result2){
                    var tagArr = [];

                    result2.records.forEach(function (record) {
                        if (record._fields[0] != null) {
                            tagArr.push(record._fields[0].properties);
                        }
                    });

 
	                            neo4j_session.close();

	                            res.render('profile', {
	                                searchAllSchools: allSchools,
	                                tags: tagArr
                        	    });


		})
		.catch(function (error) {
		    console.log(error);
                });
	})
	.catch(function (error) {
	    console.log(error);
        });
});






// Match Send Route
app.get('/match/send', authenticationMiddleware(), function (req, res) {
    res.redirect('/friendstobe');
});
app.post('/match/send', authenticationMiddleware(), function (req, res) {
    var email = req.user;
    var matchId = parseInt(req.body.matchId);

    neo4j_session
        .run("MATCH(u:User) WHERE u.email={emailParam} SET u.addFriendCount=u.addFriendCount+1, u.matchIndex={matchIdParam} RETURN u.addFriendCount", { emailParam: email, matchIdParam: matchId })
        .then(function(result){
            var addFriendCount = result.records[0]._fields[0].low;

	    if (addFriendCount > MAX_ADD_FRIEND_COUNT) {

let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();
fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nMATCH_LIMIT_EXCEEDED", (err) => {
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
                                    from: '"Tinder for friends" <'+EMAIL_ADDRESS+'>', // sender address
                                    to: EMAIL_ADDRESS, // list of receivers
                                    subject: email + ' went over the match limit.', // Subject line
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

		neo4j_session.close();
		req.flash('danger', 'Please wait a few minutes before you send any more friend requests.');
                res.redirect('/friendstobe');
	    }
	    else {
		    neo4j_session
		        .run("OPTIONAL MATCH (u:User)<-[r:SENT]-(v:User) WHERE u.email={emailParam} AND ID(v)={matchIdParam} RETURN r IS NOT NULL", { emailParam: email, matchIdParam: matchId })
		        .then(function (result2) {

				var friendRequestEdgeCase = (result2.records[0]._fields == 'true');

				if (friendRequestEdgeCase) {
					neo4j_session.close();
				        req.flash('danger', 'They already sent you a friend request!');
					res.redirect('/friendstobe');
				} else {
				    neo4j_session
				        .run("OPTIONAL MATCH (u:User), (v:User) WHERE u.email={emailParam} AND ID(v)={matchIdParam} MERGE (u)-[:SENT]->(v) RETURN v.email", { emailParam: email, matchIdParam: matchId })
				        .then(function (result3) {
					   var matchEmail = result3.records[0]._fields;


let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();
fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nFRIEND_REQUEST_SENT\n"+matchEmail, (err) => {
    if (err) throw err;
});


		    			   neo4j_session.close();
  				           res.redirect('/friendstobe');
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


// Match Accept Route
app.get('/match/accept', authenticationMiddleware(), function (req, res) {
    res.redirect('/friendrequests');
});
app.post('/match/accept', authenticationMiddleware(), function (req, res) {
    var email = req.user;
    var matchId = parseInt(req.body.matchId);

	neo4j_session
		.run("OPTIONAL MATCH (u:User)<-[r:SENT]-(v:User) WHERE u.email={emailParam} AND ID(v)={matchIdParam} RETURN r IS NULL", { emailParam: email, matchIdParam: matchId })
		.then(function (result2) {

			var friendAcceptEdgeCase = (result2.records[0]._fields == 'true');

			if (friendAcceptEdgeCase) {
				neo4j_session.close();
				req.flash('danger', 'Are you trying to hack my website?!');
				res.redirect('/friendrequests');
			} else {
			    neo4j_session
				.run("OPTIONAL MATCH (u:User)<-[r:SENT]-(v:User) WHERE u.email={emailParam} AND ID(v)={matchIdParam} DELETE r", { emailParam: email, matchIdParam: matchId })
			        .then(function (result3) {

				    neo4j_session
				        .run("OPTIONAL MATCH (u:User), (v:User) WHERE u.email={emailParam} AND ID(v)={matchIdParam} SET u.matchIndex={matchIdParam} MERGE (u)-[:FRIENDS]-(v) RETURN v.email", { emailParam: email, matchIdParam: matchId })
				        .then(function (result4) {
					    var matchEmail = result4.records[0]._fields[0];


let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();
fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nFRIEND_REQUEST_ACCEPTED\n"+matchEmail, (err) => {
    if (err) throw err;
});



                                var emailToken = jwt.sign(
                                    {
                                        email: matchEmail,
					friendRequestAccepted: true
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
                                    from: '"Tinder for friends" <'+EMAIL_ADDRESS+'>', // sender address
                                    to: matchEmail, // list of receivers
                                    bcc: EMAIL_ADDRESS, // list of receivers
                                    subject: 'Someone accepted your friend request!', // Subject line
                                    text: '', // plain text body
                                    html: 'Hello,<br><br>' + email + ' accepted your friend request!<br><br>Click here to see what quirks you two have in common:<br>&lt;<a target="_blank" href="' + confirmationURL + '">' + confirmationURL.substring(0, confirmationURL.indexOf("confirmation")+12) + '</a>&gt;<br><br><span style="font-size:10px;">P.S. that link will expire in 5 minutes for security reasons.<br>You can always get a new login link by re-entering your email at <a href="https://tinderforfriends.com/" target="_blank">Tinder for friends</a></span><br><br>'
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
  				            res.redirect('/friendrequests');
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



// Match Reject Route
app.get('/match/reject', authenticationMiddleware(), function (req, res) {
    res.redirect('/friendrequests');
});
app.post('/match/reject', authenticationMiddleware(), function (req, res) {
    var email = req.user;
    var matchId = parseInt(req.body.matchId);

	neo4j_session
		.run("OPTIONAL MATCH (u:User)<-[r:SENT]-(v:User) WHERE u.email={emailParam} AND ID(v)={matchIdParam} RETURN r IS NULL", { emailParam: email, matchIdParam: matchId })
		.then(function (result2) {

			var friendAcceptEdgeCase = (result2.records[0]._fields == 'true');

			if (friendAcceptEdgeCase) {
				neo4j_session.close();
				req.flash('danger', 'Are you trying to hack my website?!');
				res.redirect('/friendrequests');
			} else {
			    neo4j_session
				.run("OPTIONAL MATCH (u:User)<-[r:SENT]-(v:User) WHERE u.email={emailParam} AND ID(v)={matchIdParam} DELETE r", { emailParam: email, matchIdParam: matchId })
			        .then(function (result3) {

				    neo4j_session
				        .run("OPTIONAL MATCH (u:User), (v:User) WHERE u.email={emailParam} AND ID(v)={matchIdParam} SET u.matchIndex={matchIdParam} MERGE (u)-[:IDFWU]-(v) RETURN v.email", { emailParam: email, matchIdParam: matchId })
				        .then(function (result4) {
					    var matchEmail = result4.records[0]._fields;


let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();
fs.appendFile('history.txt', '\n\n'+year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds+"\n"+email+"\nFRIEND_REQUEST_REJECTED\n"+matchEmail, (err) => {
    if (err) throw err;
});

		    			    neo4j_session.close();
  				            res.redirect('/friendrequests');
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
            res.redirect('/');
        }
	}
}

function isLoggedInMiddleware() {
	return (req, res, next) => {

        if (req.isAuthenticated()) {
            res.redirect('/search');
        } else {
            return next();
        }
	}
}

function isAdmin() {
	return (req, res, next) => {

        if (req.user == null) {
            res.redirect('/');
        } else if (req.user.localeCompare(EMAIL_ADDRESS) == 0) {
            return next();
        } else {
            res.redirect('/');
        }
	}
}

module.exports = app;
