// NPM packages
const bodyParser = require("body-parser");
const express = require("express");
const app = express();

// Adjusti.co packages
const BL = require("./BL.js");
const asyncForEach = require("./asyncForEach.js");

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

// Check connection
app.get("/", function(req, res, next) {
    BL.checkConnection().then(response => {
        if (!response.success) {
            res.status(400).send(response.data);
        }
        res.status(200).send(response.data);
    });
});

/*** CRAWLER SECTION ***/

// Get all keywords
app.get("/keywords", function(req, res, next) {
    BL.getAllKeywords().then(response => {
        if (!response.success) {
            res.status(400).send(response.data);
        }
        res.status(200).send(response.data);
    });
});

// Monitor all keywords
app.get("/monitorKeywords", function(req, res, next) {
    BL.monitorAllKeywords().then(response => {
        if (response.length == 0) {
            res.status(400).send(response);
        }
        res.status(200).send("Finished");
    });
});

// Get spondsored products by keyword
app.post("/keyword", function(req, res, next) {
    BL.getKeyword(req.body.keyword).then(response => {
        if (!response.success) {
            res.status(400).send(response.data);
        }
        res.status(200).send(response.data);
    });
});

// Get product details
app.get("/product/:productASIN", function(req, res, next) {
    BL.getProduct(req.params.productASIN).then(response => {
        if (!response.success) {
            res.status(400).send(response.data);
        }
        res.status(200).send(response.data);
    });
});

// Get sponsored keywords of product by ASIN
app.get("/productKeywords/:productASIN", function(req, res, next) {
    BL.getSponsoredKeywordsByProductASIN(req.params.productASIN).then(
        response => {
            if (!response.success) {
                res.status(400).send(response.data);
            }
            res.status(200).send(response.data);
        }
    );
});

/*** EXTENSION SECTION ***/

// Add product
app.post("/product", function(req, res, next) {
    var product = {
        productASIN: req.body.productASIN,
        name: req.body.name,
        brand: req.body.brand,
        mainImage: req.body.mainImage,
        rate: req.body.rate,
        numberOfReviews: req.body.numberOfReviews,
        price: req.body.price,
        cupon: req.body.cupon
    };
    BL.addProduct(product).then(response => {
        if (!response.success) {
            res.status(400).send(response.data);
        }
        res.status(200).send(response.data);
    });
});

// Add sponsored products by keyword
app.post("/addSponsoredProductsByKeyword", function(req, res, next) {
    BL.addSponsoredProductsByKeyword(
        req.body.keyword,
        req.body.productASINs
    ).then(response => {
        if (!response.success) {
            res.status(400).send(response.data);
        }
        res.status(200).send(response.data);
    });
});

app.listen(3000, function() {
    console.log("Server is running on Port 3000");
});
