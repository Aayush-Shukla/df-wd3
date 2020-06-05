var express = require('express');
var router = express.Router();


const { check, validationResult } = require('express-validator');
var bcrypt=require('bcrypt');
const saltRounds=10;




router.get('/',authenticationMiddleware (), function(req, res, next) {
    // console.log(req.user,req.isAuthenticated())
    profileid=req.session.user
    // console.log(req.cookies,req.session,"helllooooooooooooooooooo")

    const db=require('../db.js')
    db.query("select invites.invite_id,(select count(invite_id) from accepted where accepted.invite_id=invites.invite_id and bool=TRUE) as count,heading,content,footer,created_at from invites where author_id=(?) AND event_at > NOW() ORDER BY created_at DESC", [profileid], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }


        db.query("SELECT name, heading,content,footer,event_at,author_id FROM invites inner join accepted on invites.invite_id=accepted.invite_id inner join users on invites.author_id=users.id where user=(?) AND bool=TRUE AND event_at > NOW() ", [profileid], function (error, accepted, fields) {
            if (error) {
                console.log(error, 'dbquery');
            }

            db.query("SELECT substring(heading,1,25) as heading,link FROM invites where eligiblemem LIKE '%\"?\"%' AND event_at > NOW() AND author_id !=(?)",[profileid,profileid], function (error, available, fields) {
                if (error) {
                    console.log(error, 'dbquery');
                }

console.log(accepted)

                res.render('home', {data: {created: results, accepted: accepted,available:available}});

            })
    })
    })


});






router.get('/register',checkNotAuthenticated(), function(req, res, next) {
  res.render('register', { title: 'Registration' });
});

router.get('/search',authenticationMiddleware(), function(req, res, next) {
  res.render('search', { title: 'Registration' });
});


router.get('/create',authenticationMiddleware(), function(req, res, next) {
    profileid=req.session.user
    const db=require('../db.js')

    db.query("SELECT name,id  FROM users WHERE id!=(?)",[profileid], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        console.log(results)
        res.render('create',{names:results});

    })
});

router.get('/profile',authenticationMiddleware (), function(req, res, next) {
    authorid=req.session.user

    const db=require('../db.js')
    db.query("SELECT * FROM post WHERE author_id =(?) ORDER BY created_at DESC", [authorid], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        db.query("SELECT (Select count(*) from post where author_id=(?))as postno, (SELECT count(*) from followings where user_id=(?))as followers,(SELECT count(*) from followers where user_id=(?))as followings,(select name from users where id=(?))as name", [authorid,authorid,authorid,authorid], function (error, profinfo, fields) {
            if (error) {
                console.log(error, 'dbquery');
            }
                console.log(results)
            db.query("SELECT * FROM users WHERE id =(?) ", [authorid], function (error, userdetail, fields) {
                if (error) {
                    console.log(error, 'dbquery');
                }
                console.log(userdetail[0])

                res.render('profile', {data: {userblogs: results, info: profinfo[0],userinfo: userdetail[0]}})
            })
        })
    })




});
router.post('/create',authenticationMiddleware (), function(req, res, next) {


    time=req.body.eventtime
    heading=req.body.heading
    content=req.body.content
    footer=req.body.footer
    authorid=req.session.user

    members=JSON.stringify(req.body.check)
    link=Math.random().toString(36).substring(2,7)
    console.log(time,'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')

    const db=require('../db.js')

        db.query("INSERT INTO invites(author_id,heading,content,footer,eligiblemem,link,event_at)VALUES(?,?,?,?,?,?,?)", [authorid, heading,content,footer,members,link,time], function (error, results, fields) {
            if (error) {
                console.log(error,'dbquery');
            }
            console.log("success")
            db.query("SELECT * FROM invites",  function (error, last, fields) {
                if (error) {
                    console.log(error,'dbquery');
                }
                l=last.pop()

                res.render('link',{last:l})




            })})





});

router.get('/login',checkNotAuthenticated(), function(req, res, next) {
  res.render('login', { title: 'login' });
});




router.get('/invite/:link',authenticationMiddleware (), function(req, res, next) {


    invitelink=req.params.link
    currentuser=req.session.user

    const db=require('../db.js')
    db.query("SELECT * FROM invites join users on invites.author_id=users.id WHERE link =(?) ", [invitelink], function (error,results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        // console.log(profileid[0].id)
        if(results.length!=0 && strtoarr(currentuser,results[0].eligiblemem) ) {
            console.log(results,"sds")
            res.render('invite',{invite:results[0]})
        }
        else{
            res.render('notfound')
        }

    })


    function strtoarr(num,s) {
        n=num.toString()
        var a=JSON.parse(s)
        // console.log(n,a[0])
        var i;
        for (i = 0; i < a.length; i++) {
            if (a[i] === n) {
                return true;
            }
        }

        return false;


    }

});


router.get('/accept/:id',authenticationMiddleware (), function(req, res, next) {


    inviteid=req.params.id
    currentuser=req.session.user
    boolean=true;

    const db=require('../db.js')

    db.query("SELECT * FROM accepted WHERE invite_id=(?) AND user=(?)", [inviteid,currentuser], function (error,checkdup, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        // console.log(profileid[0].id)
        if(checkdup.length!=0){

            db.query("UPDATE accepted SET bool=(?) where invite_id=(?) AND user=(?) ", [boolean,inviteid,currentuser], function (error,results, fields) {
                if (error) {
                    console.log(error, 'dbquery');
                }
                res.redirect('/')

            })
            // console.log(profileid[0].id)
        }
        else{
            db.query("INSERT INTO accepted(invite_id,user,bool)VALUES (?,?,?) ", [inviteid,currentuser,boolean], function (error,results, fields) {
                if (error) {
                    console.log(error, 'dbquery');
                }
                res.redirect('/')

            })

        }




    })

});


router.get('/reject/:id',authenticationMiddleware (), function(req, res, next) {


    inviteid=req.params.id
    currentuser=req.session.user
    boolean=false

    const db=require('../db.js')
    db.query("SELECT * FROM accepted WHERE invite_id=(?) AND user=(?)", [inviteid,currentuser], function (error,checkdup, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        // console.log(profileid[0].id)




        if(checkdup.length!=0){


            db.query("UPDATE accepted SET bool=(?) where invite_id=(?) AND user=(?) ", [boolean,inviteid,currentuser], function (error,results, fields) {
                if (error) {
                    console.log(error, 'dbquery');
                }
                res.redirect('/')
                // console.log(profileid[0].id)

            })
        }
        else{
            db.query("INSERT INTO accepted(invite_id,user,bool)VALUES (?,?,?) ", [inviteid,currentuser,boolean], function (error,results, fields) {
                if (error) {
                    console.log(error, 'dbquery');
                }
                res.redirect('/')

            })

        }





    })

});



router.get('/follow/:id',authenticationMiddleware (), function(req, res, next) {

    const db=require('../db.js')
    userid=req.session.user
    tofollow=req.params.id
    db.query("INSERT INTO followings(following_id,user_id)VALUES (?,?)", [userid,tofollow], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        console.log(results)
    })
        db.query("INSERT INTO followers(follower_id,user_id)VALUES(?,?)", [tofollow,userid], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        console.log(results)
    })

    db.query("SELECT name FROM users WHERE id=(?)", [tofollow], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        var redirect=results[0].name
        console.log(redirect)
        res.redirect(`/user/${redirect}`);

    })



});





router.get('/unfollow/:id',authenticationMiddleware (), function(req, res, next) {

    const db=require('../db.js')
    userid=req.session.user
    tofollow=req.params.id
    db.query("DELETE FROM followings WHERE following_id=(?) AND user_id=(?)", [userid,tofollow], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        console.log(results)
    })
    db.query("DELETE FROM followers WHERE follower_id=(?) AND user_id=(?)", [tofollow,userid], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        console.log(results,'del')
    })

    db.query("SELECT name FROM users WHERE id=(?)", [tofollow], function (error, results, fields) {
        if (error) {
            console.log(error, 'dbquery');
        }
        var redirect=results[0].name
        console.log(redirect)
        res.redirect(`/user/${redirect}`);

    })



});





router.post('/login', function(req,res,next){




    username=req.body.username
    password=req.body.password

    const db=require('../db');
    db.query('SELECT id,pass FROM users WHERE name=?',[username],function(err,results,fields){
        if(err){
           console.log(err)
        }
        if(results.length===0){
            res.redirect('/login')

        }
        else {

            const hash = results[0].pass.toString();
            bcrypt.compare(password, hash, function (err, response) {

                if (response === true) {
                    req.session.user =  results[0].id;
                    res.redirect('/')
                } else {
                    res.redirect('/login')

                }
            })
        }

    })











    });

router.get('/logout', function(req, res, next) {
    res.clearCookie('user_sid');
    req.session.destroy();
    res.redirect('/login')
});










router.post('/register', check('username').not().isEmpty().withMessage('name cant be empty'),function(req, res, next) {

    exist=[]
    username=req.body.username
    email=req.body.email
    pword=req.body.password
    const db=require('../db.js')
    db.query("SELECT * FROM users WHERE name=(?) OR email =(?)",[username,email],function (error,existresult,fields){



        if (existresult.length!=0) {
            // return res.status(422).json({ errors: errors.array() });
            res.render('register', { title: 'Registration error' ,errors :'Username not available OR Email exists'});
        }
        else{

            bcrypt.hash(pword,saltRounds,function(err,hash) {
                db.query("INSERT INTO users(name,email,pass)VALUES(?,?,?)", [username, email, hash], function (error, results, fields) {
                    if (error) {
                        console.log(error,'dbquery');
                    }

                    db.query('SELECT LAST_INSERT_ID() as user_id',function(error,results,fields){
                        if(error) {
                            console.log(error)
                        }
                        console.log(results,"sssssssssssssssssssssssssssssss")
                        // const user_id=results[0]
                        // req.session.user =  user_id;
                        res.redirect('/')
                    })



                })
            })
        }









    })






});








router.post('/search',authenticationMiddleware (), function(req, res, next) {



});





//
function authenticationMiddleware () {
    return (req, res, next) => {
        console.log(`req.session.user: ${JSON.stringify(req.session)}`);

        if (req.session.user && req.cookies.user_sid) {
            next();
        } else {
            res.redirect('/login')
        }
    }
}
 function checkNotAuthenticated () {
    return (req, res, next) => {
        console.log(`req.session.user: ${JSON.stringify(req.session)}`);

        if (req.session.user && req.cookies.user_sid) {
            res.redirect('/');
        } else {
            next();
        }
    }
}




module.exports = router;
