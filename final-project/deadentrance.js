//declare express consts
const express = require('express')
const expressHandlebars = require('express-handlebars')
const app = express()

//fs to read json files
const fs = require('fs')

//empty cart array to hold item data
const cart = [];
let cartPrice = 0;

//static files or folders are specified before any route
app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: true }));

//configure our express app to use handlebars
app.engine('handlebars', expressHandlebars.engine({
    defaultLayout: 'main',
}))

app.set('view engine','handlebars')

//set products.json data to const
const productData = JSON.parse(fs.readFileSync('data/products.json', 'utf-8'));

//setup port
const port = process.env.port || 3000

//home route
app.get('/',(req,res)=>{
    const allProducts = productData.products;
    var data = require('./data/products.json')

    //choose a subset of 5 random products for featured products
    const selectedProducts = chooseRandomProducts(allProducts, 5);

    //choose a subset of 5 random products for slideshow
    const slideshowProducts = chooseRandomProducts(allProducts, 5);

    //sort products of each category into their own consts
    const topProducts = productData.products.filter(product => getCategoryFromId(product.id) === 'tops');
    const bottomsProducts = productData.products.filter(product => getCategoryFromId(product.id) === 'bottoms');
    const outerwearProducts = productData.products.filter(product => getCategoryFromId(product.id) === 'outerwear');

    //choose one random product from each category
    const topProduct = chooseRandomProducts(topProducts, 1);
    const bottomsProduct = chooseRandomProducts(bottomsProducts, 1);
    const outerwearProduct = chooseRandomProducts(outerwearProducts, 1);
    
    //render home view
    res.render('home-page',{ data, products: selectedProducts, slideshow: slideshowProducts, top: topProduct, bottom: bottomsProduct, outerwear: outerwearProduct })
})

//helper functions for home route

    //function to choose a random subset of products
    function chooseRandomProducts(allProducts, numProducts) {
        //spread operator creates temp copy of allProducts, sorts and assigns to shuffledProducts
        const shuffledProducts = [...allProducts].sort(() => 0.5 - Math.random()); //0.5 - Math.random creates roughly 50% negative 50% positive values
        //slice selected first numProducts of shuffled allProducts array
        return shuffledProducts.slice(0, numProducts);
    }

    //function to determine the category based on the productId range
    function getCategoryFromId(productId) {
        if (productId >= 1 && productId <= 12) {
            return 'outerwear';
        } else if (productId >= 13 && productId <= 24) {
            return 'tops';
        } else if (productId >= 25 && productId <= 36) {
            return 'bottoms';
        }
        //handle else
        return null;
    }

//individual product routes from home, category and product pages using productId
app.get(['/item/:id', '/product/:id'], (req, res) => {
    const productId = req.params.id;

    //find the product with matching id in productData
    const selectedProduct = productData.products.find(item => item.id === parseInt(productId, 10)); //parseInt converts productId to int (base 10)

    if (!selectedProduct) {
        //if product is not found
        res.status(404).send('Product not found');
        return;
    }

    const category = getCategoryFromId(productId);
    //take all category products from productData and store in categoryData
    const categoryData = productData.products.filter(product => getCategoryFromId(product.id) === category);
    //choose four other products from the same category
    const otherProducts = chooseRandomProducts(categoryData, 4);

    //render view with the selected product and other products in category
    res.render('itemdetails-page', { product: selectedProduct, otherProducts, productData });
});

//route for Tops page
app.get('/tops', (req, res) => {
    const topsData = require('./data/products.json');
    const topsProducts = productData.products.filter(product => getCategoryFromId(product.id) === 'tops');
    res.render('category-page', { data: topsData, products: topsProducts, category: 'Tops' });
});

//route for Bottoms page
app.get('/bottoms', (req, res) => {
    const bottomsData = require('./data/products.json');
    const bottomsProducts = productData.products.filter(product => getCategoryFromId(product.id) === 'bottoms');
    res.render('category-page', { data: bottomsData, products: bottomsProducts, category: 'Bottoms' });
});

//route for Outerwear page
app.get('/outerwear', (req, res) => {
    const outerwearData = require('./data/products.json');
    const outerwearProducts = productData.products.filter(product => getCategoryFromId(product.id) === 'outerwear');
    res.render('category-page', { data: outerwearData, products: outerwearProducts, category: 'Outerwear' });
});

//route for About page
app.get('/about',(req,res)=>{
    var data = require('./data/info.json')
    res.render('about-page',{ data })
})

//redirects back to product page after adding to cart
app.post('/addToCart/:id', (req, res) => {
    //get id from req params
    const productId = req.params.id;

    //try to add item to cart, if successful, redirect back to item page
    if (addToCart(productId)) {
        res.redirect(`/item/${productId}`);
    } else { //if product wasn't found, throw 404
        res.status(404).send('Product not found');
    }
});

    //helper function to add products to cart
    function addToCart(productId) {
        //find and store product from productId param
        const product = productData.products.find(item => item.id === parseInt(productId, 10)); //again, parseInt converts productId to int

        //if product is found add product to cart array and return true
        if (product) {
            cart.push(product);
            cartPrice += parseInt(product.price.replace('$', ''), 10);
            return true;
        }
        //handle else
        return false;
    }

//route to display cart page
app.get('/cart', (req, res) => {
    res.render('cart-page', { cart, cartPrice });
});

//post route to handle form submission
app.post('/checkout', (req, res) => {
    const { name, address, email, phone } = req.body; //req.body stores form data

    //create order object using form data
    const order = {
        name,
        address,
        email,
        phone,
        items: cart.slice(), //save copy of cart to items
    };

    //clear cart after checkout
    cart.length = 0;

    //save order data to orders.json
    saveOrder(order);

    //redirect to thankyou page after checkout
    res.redirect('/thankyou');
});

    //helper function to save order data to orders.json
    function saveOrder(order) {
        try {
            //read existing orders from orders.json
            const existingOrders = JSON.parse(fs.readFileSync('./data/orders.json', 'utf-8'));

            //add new order to existing orders
            existingOrders.push(order);

            //write the updated orders back to orders.json
            fs.writeFileSync('./data/orders.json', JSON.stringify(existingOrders, null, 2), 'utf-8');
        } catch (error) { //catch just to be safe
            console.error('Error saving order:', error.message);
        }
    }

//route for Thank You page
app.get('/thankyou',(req,res)=>{
    var data = require('./data/info.json')
    res.render('thankyou-page',{ data })
})

//error handling ->  app.use() basic express route 
app.use((req,res) => {
    res.status(404)
    res.render('404')
})

//server error 500
app.use((error,req,res,next) => {
    console.log(error.message)
    res.status(500)
    res.render('500') 
}) 

//setup listener
app.listen(port,()=>{
    console.log(`Server started http://localhost:${port}`)
    console.log('To close press Ctrl-C')
})

