const express = require('express')
const expressHandlebars = require('express-handlebars')
const fs = require('fs')

const cart = [];

const app = express()

//static files or folders are specified before any route
app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: true }));
//configure our express app to use handlebars
app.engine('handlebars', expressHandlebars.engine({
    defaultLayout: 'main',
}))
app.set('view engine','handlebars')
//ends handlebar configuration

const productData = JSON.parse(fs.readFileSync('data/products.json', 'utf-8'));

const port = process.env.port || 3000

//routes go before 404 and 500
app.get('/',(req,res)=>{
    const allProducts = productData.products;
    var data = require('./data/products.json')

    // Choose a subset of 5 random products
    const selectedProducts = chooseRandomProducts(allProducts, 5);
    const slideshowProducts = chooseRandomProducts(allProducts, 5);
    const topProducts = productData.products.filter(product => getCategoryFromId(product.id) === 'tops');
    const bottomsProducts = productData.products.filter(product => getCategoryFromId(product.id) === 'bottoms');
    const outerwearProducts = productData.products.filter(product => getCategoryFromId(product.id) === 'outerwear');

    const topProduct = chooseRandomProducts(topProducts, 1);
    const bottomsProduct = chooseRandomProducts(bottomsProducts, 1);
    const outerwearProduct = chooseRandomProducts(outerwearProducts, 1);

    res.render('home-page',{data, products: selectedProducts, slideshow: slideshowProducts, top: topProduct, bottom: bottomsProduct, outerwear: outerwearProduct})
})

// Function to choose a random subset of products
function chooseRandomProducts(allProducts, numProducts) {
    const shuffledProducts = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffledProducts.slice(0, numProducts);
}

app.get('/item/:id', (req, res) => {
    const productId = req.params.id;
    // Find the product with the matching ID in your productData
    const selectedProduct = productData.products.find(item => item.id === parseInt(productId, 10));

    if (!selectedProduct) {
        // Handle case where product is not found (e.g., display an error page)
        res.status(404).send('Product not found');
        return;
    }

    // Determine the category based on the product ID range
    let category;
    if (productId >= 1 && productId <= 12) {
        category = 'outerwear';
    } else if (productId >= 13 && productId <= 24) {
        category = 'tops';
    } else if (productId >= 25 && productId <= 36) {
        category = 'bottoms';
    } else {
        // Handle unknown category or invalid product ID range
        res.status(404).send('Invalid product ID range');
        return;
    }

    // Choose four other products from the same category
    const otherProducts = chooseProductsByCategory(productData.products, category, 4, productId);

    // Render the 'itemdetails-page' view with the selected product and other products
    res.render('itemdetails-page', {
        product: selectedProduct,
        otherProducts,
        productData
    });
});

// Redirect route for individual products
app.get('/product/:id', (req, res) => {
    const productId = req.params.id;
    // Redirect to the '/item/:id' route to ensure consistent handling of otherProducts
    res.redirect(`/item/${productId}`);
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap array[i] and array[j]
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to choose products from the same category
function chooseProductsByCategory(allProducts, category, numProducts, excludeProductId) {
    const productsInCategory = allProducts.filter(product => {
        return product.id !== excludeProductId && getCategoryFromId(product.id) === category;
    });

    // Shuffle the products and select the first four
    const shuffledProducts = shuffleArray(productsInCategory);
    return shuffledProducts.slice(0, numProducts);
}

// Function to determine the category based on the product ID range
function getCategoryFromId(productId) {
    if (productId >= 1 && productId <= 12) {
        return 'outerwear';
    } else if (productId >= 13 && productId <= 24) {
        return 'tops';
    } else if (productId >= 25 && productId <= 36) {
        return 'bottoms';
    }
    // Handle unknown category or invalid product ID range
    return null;
}

// define routes for products
productData.products.forEach(product => {
    app.get(`/product/${product.id}`, (req, res) => {
      // render the item detail page with the specific item data
      res.render('itemdetails-page', { product, productData });
    });
});

// route for Tops
app.get('/tops', (req, res) => {
    const topsData = require('./data/products.json');
    const topsProducts = productData.products.filter(product => getCategoryFromId(product.id) === 'tops');
    res.render('category-page', { data: topsData, products: topsProducts, category: 'Tops' });
});

// route for Bottoms
app.get('/bottoms', (req, res) => {
    const bottomsData = require('./data/products.json');
    const bottomsProducts = productData.products.filter(product => getCategoryFromId(product.id) === 'bottoms');
    res.render('category-page', { data: bottomsData, products: bottomsProducts, category: 'Bottoms' });
});

// route for Outerwear
app.get('/outerwear', (req, res) => {
    const outerwearData = require('./data/products.json');
    const outerwearProducts = productData.products.filter(product => getCategoryFromId(product.id) === 'outerwear');
    res.render('category-page', { data: outerwearData, products: outerwearProducts, category: 'Outerwear' });
});

app.get('/about',(req,res)=>{
    var data = require('./data/info.json')
    res.render('about-page',{ data })
})

app.get('/thankyou',(req,res)=>{
    var data = require('./data/info.json')
    res.render('thankyou-page',{ data })
})

function addToCart(productId) {
    const product = productData.products.find(item => item.id === parseInt(productId, 10));

    if (product) {
        cart.push(product);
        return true;
    }

    return false;
}

app.post('/addToCart/:id', (req, res) => {
    const productId = req.params.id;

    if (addToCart(productId)) {
        res.redirect(`/item/${productId}`);
    } else {
        res.status(404).send('Product not found');
    }
});

// Route to display the cart page
app.get('/cart', (req, res) => {
    res.render('cart-page', { cart });
});

// Route to handle checkout
app.post('/checkout', (req, res) => {
    const { name, address, email, phone } = req.body;

    // Create an order object
    const order = {
        name,
        address,
        email,
        phone,
        items: cart.slice(),
    };

    // Clear the cart after checkout
    cart.length = 0;

    // Save the order data to orders.json
    saveOrder(order);

    res.redirect('/thankyou'); // Redirect to thankyou page after checkout
});

// Function to save order data to orders.json
function saveOrder(order) {
    try {
        // Read existing orders from orders.json
        const existingOrders = JSON.parse(fs.readFileSync('./data/orders.json', 'utf-8'));

        // Add the new order to the existing orders
        existingOrders.push(order);

        // Write the updated orders back to orders.json
        fs.writeFileSync('./data/orders.json', JSON.stringify(existingOrders, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving order:', error.message);
    }
}

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

