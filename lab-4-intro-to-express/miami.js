const express = require('express')

const expressHandlebars = require('express-handlebars')

const app = express()

//configure express app to use handlebars
app.engine('handlebars', expressHandlebars.engine({
    defaultLayout: 'main',
}))
app.set('view engine','handlebars')

const port = process.env.port || 3000

//routing
app.get('/', (req,res) => {
    res.type('text/plain')
    res.send('Miami')
})
app.get('/beaches', (req,res) => {
    res.type('text/plain')
    res.send('Miami Beaches')
})
app.get('/nightlife', (req,res) => {
    res.type('text/plain')
    res.send('Miami Nightlife')
})
app.get('/food', (req,res) => {
    res.type('text/plain')
    res.send('Miami Food')
})
app.get('/about', (req,res) => {
    res.render('about')
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

