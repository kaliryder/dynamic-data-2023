let eList = require('../data/emails.json')

const fs = require("fs")

exports.newsletterSignup = (req,res) => {
    res.render('newsletter-signup', { csrf : 'supersecret'  })
}
exports.newsletterSignupList = (req,res) => {
    console.log(eList)
    eList = require('../data/emails.json')
    res.render('userspage', { "users": eList.users  })
}

exports.newsletterUser = (req,res) => {
     //eList = require('../data/emails.json')
     console.log(eList)
    var userDetails = eList.users.filter((user)=>{ 
        return user.email == req.params.email
     })

     console.log(userDetails)
    res.render('userdetails',{"users": userDetails})
}

exports.newsletterUserDelete = (req,res) => {
    var newList = {"users":[]}
    newList.users = eList.users.filter((user)=>{ 
        return user.email != req.params.email
     })
     console.log("deleting: " + req.params.email)

     var json = JSON.stringify(newList)
     console.log(json)

     fs.writeFile('./data/emails.json',json,'utf8',()=>{})

     eList = require('../data/emails.json')
     res.send('<a href="/newsletter/list">Go Back</a>')
     //res.redirect(303,'/newsletter/list')
}

exports.newsletterSignupProcess = (req,res) => {

    //Then we do something here
    console.log(req.body)
    //req.body.email
    //req.body.firstname
    //req.body.lastname
    var newUser = {
        'firstname' : req.body.firstname,
        'lastname' : req.body.lastname,
        'address':req.body.address,
        'city':req.body.city,
        'state':req.body.state,
        'zip':req.body.zip,
        'email' : req.body.email
    }
    //the push method adds items to an array
    eList.users.push(newUser)

    var json = JSON.stringify(eList)

    console.log(json)

    fs.writeFileSync('./data/emails.json',json,'utf8',()=>{})

   
    res.redirect(303,'/newsletter/thankyou')
    //res.send("you posted something to /process " + req.body.email)
             
}