//declare express consts
const express = require('express')
const expressHandlebars = require('express-handlebars')
const app = express()

//fs to read json files
const fs = require('fs')

//empty cart array to hold item data
const cart = [];

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
    //sort of products of each category into their own consts
    const topProducts = productData.products.filter(product => getCategoryFromId(product.id) === 'tops');
    const bottomsProducts = productData.products.filter(product => getCategoryFromId(product.id) === 'bottoms');
    const outerwearProducts = productData.products.filter(product => getCategoryFromId(product.id) === 'outerwear');
    //choose one random product from each category
    const topProduct = chooseRandomProducts(topProducts, 1);
    const bottomsProduct = chooseRandomProducts(bottomsProducts, 1);
    const outerwearProduct = chooseRandomProducts(outerwearProducts, 1);
    
    //render view
    res.render('home-page',{data, products: selectedProducts, slideshow: slideshowProducts, top: topProduct, bottom: bottomsProduct, outerwear: outerwearProduct})
})

    //function to choose a random subset of products
    function chooseRandomProducts(allProducts, numProducts) {
        const shuffledProducts = [...allProducts].sort(() => 0.5 - Math.random());
        return shuffledProducts.slice(0, numProducts);
    }

//route items to individual product pages
app.get('/item/:id', (req, res) => {
    const productId = req.params.id;

    //find the product with the matching ID in your productData
    const selectedProduct = productData.products.find(item => item.id === parseInt(productId, 10));

    if (!selectedProduct) {
        //handle case where product is not found
        res.status(404).send('Product not found');
        return;
    }

    //determine the category based on the productId range
    let category;
    if (productId >= 1 && productId <= 12) {
        category = 'outerwear';
    } else if (productId >= 13 && productId <= 24) {
        category = 'tops';
    } else if (productId >= 25 && productId <= 36) {
        category = 'bottoms';
    } else {
        //handle unknown category or invalid product ID range
        res.status(404).send('Invalid product ID range');
        return;
    }

    //choose four other products from the same category
    const otherProducts = chooseProductsByCategory(productData.products, category, 4, productId);

    //render view with the selected product and other products
    res.render('itemdetails-page', {
        product: selectedProduct,
        otherProducts,
        productData
    });
});

//redirect route for individual products
app.get('/product/:id', (req, res) => {
    const productId = req.params.id;
    //redirect to the '/item/:id' route to ensure consistent handling of otherProducts
    res.redirect(`/item/${productId}`);
});

//function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        //swap array[i] and array[j]
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

//function to choose products from the same category
function chooseProductsByCategory(allProducts, category, numProducts, excludeProductId) {
    const productsInCategory = allProducts.filter(product => {
        return product.id !== excludeProductId && getCategoryFromId(product.id) === category;
    });

    //shuffle the products and select the first four
    const shuffledProducts = shuffleArray(productsInCategory);
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
    //handle unknown category or invalid productId range
    return null;
}

//define routes for products
productData.products.forEach(product => {
    app.get(`/product/${product.id}`, (req, res) => {
      //render the item detail page with the specific item data
      res.render('itemdetails-page', { product, productData });
    });
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

//route for Thank You page
app.get('/thankyou',(req,res)=>{
    var data = require('./data/info.json')
    res.render('thankyou-page',{ data })
})

//function to add products to cart
function addToCart(productId) {
    const product = productData.products.find(item => item.id === parseInt(productId, 10));

    if (product) {
        cart.push(product);
        return true;
    }

    return false;
}

//redirects back to product page after adding to cart
app.post('/addToCart/:id', (req, res) => {
    const productId = req.params.id;

    if (addToCart(productId)) {
        res.redirect(`/item/${productId}`);
    } else {
        res.status(404).send('Product not found');
    }
});

//route to display cart page
app.get('/cart', (req, res) => {
    res.render('cart-page', { cart });
});

//route to handle checkout
app.post('/checkout', (req, res) => {
    const { name, address, email, phone } = req.body;

    //create order object
    const order = {
        name,
        address,
        email,
        phone,
        items: cart.slice(),
    };

    //clear cart after checkout
    cart.length = 0;

    //save order data to orders.json
    saveOrder(order);

    //redirect to thankyou page after checkout
    res.redirect('/thankyou');
});

//function to save order data to orders.json
function saveOrder(order) {
    try {
        //read existing orders from orders.json
        const existingOrders = JSON.parse(fs.readFileSync('./data/orders.json', 'utf-8'));

        //add new order to existing orders
        existingOrders.push(order);

        //write the updated orders back to orders.json
        fs.writeFileSync('./data/orders.json', JSON.stringify(existingOrders, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving order:', error.message);
    }
}

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
    //console.log('Server starter http://localhost:'+port)
    console.log('To close press Ctrl-C')
})

