const express = require('express')

//add the view engine 
const expressHandlebars = require('express-handlebars') 

const app = express()

//static files or folders are specified before any route
app.use(express.static(__dirname + '/public'))

//configure our express app to use handlebars
app.engine('handlebars', expressHandlebars.engine({
    defaultLayout: 'main',
}))
app.set('view engine','handlebars')
//ends handlebar configuration

const port = process.env.port || 3000

//require gallery outside the view bc we will use the same in all get requests
const gallery = require('./data/gallery.json')

//routes go before 404 and 500
app.get('/',(req,res)=>{
    var data = require('./data/home-data.json')
    res.render('page',{ data, gallery })
})

app.get('/centralpark',(req,res)=>{
    var data = require('./data/CP-data.json')
    res.render('page',{ data, gallery })
})

app.get('/timessquare',(req,res)=>{
    var data = require('./data/TS-data.json')
    res.render('page',{ data, gallery })
})

app.get('/met',(req,res)=>{
    var data = require('./data/MET-data.json')
    res.render('page',{ data, gallery })
})

app.get('/moma',(req,res)=>{
    var data = require('./data/MOMA-data.json')
    res.render('page',{ data, gallery })
})

//Error handling ->  app.use() basic express route 
app.use((req,res) => {
    res.status(404)
    res.render('404')
})

//Server Error 500
app.use((error,req,res,next) => {
    console.log(error.message)
    res.status(500)
    res.render('500') 
}) 

// setup listener
app.listen(port,()=>{
    console.log(`Server started http://localhost:${port}`)
    //console.log('Server starter http://localhost:'+port)
    console.log('To close press Ctrl-C')
})

