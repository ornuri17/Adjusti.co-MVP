// NPM packages
const bodyParser = require("body-parser");
const express = require("express");
const app = express();

// Adjusti.co packages
const BL = require("./BL.js");
const productMonitor = require("./productMonitor.js");

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

// Get all keywords
app.get("/keywords", function(req, res, next) {
    BL.getAllKeywords().then(response => {
        if (!response.success) {
            res.status(400).send(response.data);
        }
        res.status(200).send(response.data);
    });
});

// Add keyword
app.post("/keyword/:keyword", function(req, res, next) {
    BL.addKeyword(req.body.keyword).then(response => {
        if (!response.success) {
            res.status(400).send(response.data);
        }
        res.status(200).send(response.data);
    });
});

// Get product
app.get("/product/:productASIN", function(req, res, next) {
    BL.addProduct(req.params.productASIN).then(response => {
        if (!response.success) {
            res.status(400).send(response.data);
        }
        res.status(200).send(response.data);
    });
});

// Add product
app.post("/product", function(req, res, next) {
    var product = {
        productASIN: req.body.productASIN,
        name: req.body.name,
        brand: req.body.brand,
        mainImage: req.body.mainImage,
        rate: req.body.rate,
        numberOfReviews: req.body.numberOfReviews
    };
    BL.addProduct(product).then(response => {
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

// Get sponsored products by keyword
app.get("/keywordProducts/:keyword", function(req, res, next) {
    BL.getSponsoredProductsByKeyword(req.params.keyword).then(response => {
        if (!response.success) {
            res.status(400).send(response.data);
        }
        res.status(200).send(response.data);
    });
});

// Add sponsored products by keyword
app.post("/keywordProducts", function(req, res, next) {
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

// Add sponsored products by keyword
app.post("/monitorKeyword", function(req, res, next) {
    BL.monitorKeyword(req.body.keyword).then(response => {
        if (!response.success) {
            res.status(400).send(response.data);
        }
        res.status(200).send(response.data);
    });
});

app.listen(3000, function() {
    console.log("Server is running on Port 3000");
});
