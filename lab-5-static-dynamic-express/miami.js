const express = require('express')

const expressHandlebars = require('express-handlebars')

const app = express()

//static fies or folders are specified before any route
app.use(express.static(__dirname + "/public"))

//configure express app to use handlebars
app.engine('handlebars', expressHandlebars.engine({
    defaultLayout: 'main',
}))
app.set('view engine','handlebars')

const port = process.env.port || 3000

//routing
app.get('/', (req,res) => {
    res.render('home')
})
app.get('/beaches', (req,res) => {
    res.type('text/plain')
    res.send('Miami Beaches')
})
app.get('/nightlife', (req,res) => {
    res.render('nightlife')
})
app.get('/food', (req,res) => {
    res.type('text/plain')
    res.send('Miami Food')
})
app.get('/about', (req,res) => {
    res.render('about',{
        title:"About Miami",
        pageTitle:"About Miami Travel",
        image:"miami2.jpg",
        description:"Miami is a beautiful city"
    })
})
//intentional 500 error
app.get('/oops', (request,response) => {
    res.type('text/plain')
    res.send('Miami Travel')
})

//404 - handles non-existent routes
app.use((req,res) => {
    res.status(404)
    res.render('404')
})

//500 - handles code errors
app.use((error,req,res,next) => {
    console.log(error.message)
    res.status(500)
    res.render('500')
})

//start server
app.listen(port, ()=> {
    console.log(`Express is running on http://localhost:${port};`)
    console.log(`press Ctrl-C to terminate.`)
})

