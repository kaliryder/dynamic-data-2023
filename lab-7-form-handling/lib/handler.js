// let eList = {"users":[]}
let eList = require('../data/emails.json')
const fs = require("fs")

exports.newsletterSignup = (req,res) => {
    res.render('newsletter-signup', {csrf:'supersecret'})
}

exports.newsletterSignupProcess = (req,res) => {
    console.log(req.body)

    eList.users.push(req,body)

    var json = JSON.stringify(eList)

    console.log(json)

    json.writeFileSync('./data/emails/json', json,'utf8', ()=>{})
}

exports.newsletterSignupList = (req,res) => {
    console.log(eList)
    res.render('userspage', { "users": eList.users})
}
 