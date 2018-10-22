// NPM packages

// Adjusti.co packages
const DAL = require("./DAL.js");
const productMonitor = require("./productMonitor.js");
const keywordMonitor = require("./keywordMonitor.js");

// Check connection
function checkConnection() {
    return new Promise((resolve, reject) => {
        DAL.checkConnection().then(response => {
            resolve(response);
        });
    });
}

// Get all keywords
function getAllKeywords() {
    return new Promise((resolve, reject) => {
        DAL.getAllKeywords().then(response => {
            resolve(response);
        });
    });
}

// Add keyword
function addKeyword(keyword) {
    return new Promise((resolve, reject) => {
        DAL.addKeyword(keyword).then(response => {
            resolve(response);
        });
    });
}

// Get product details
function getProduct(productASIN) {
    return new Promise((resolve, reject) => {
        DAL.getProduct(productASIN).then(response => {
            // If product is not in the DB
            if (response.data == []) {
                // Get product details from product page
                productMonitor.getProductDetails(productASIN).then(details => {
                    var product = {
                        productASIN: details.productASIN,
                        name: details.name,
                        brand: details.brand,
                        mainImage: details.mainImage,
                        rate: details.rate,
                        numberOfReviews: details.numberOfReviews
                    };
                    // Add product details to the DB
                    DAL.addProduct(product).then(response => {
                        resolve(response);
                    });
                });
            }
            resolve(response);
        });
    });
}

// Add product
function addProduct(product) {
    return new Promise((resolve, reject) => {
        DAL.addProduct(product).then(response => {
            resolve(response);
        });
    });
}

// Get sponsored keywords of product by ASIN
function getSponsoredKeywordsByProductASIN(productASIN) {
    return new Promise((resolve, reject) => {
        DAL.getSponsoredKeywordsByProductASIN(productASIN).then(response => {
            resolve(response);
        });
    });
}

// Get sponsored products by keyword
function getSponsoredProductsByKeyword(keyword) {
    return new Promise((resolve, reject) => {
        DAL.getSponsoredProductsByKeyword(keyword).then(response => {
            // If keyword is not in the DB
            if (response.data == []) {
                // Get sponsored products of the keyword from search page
                monitorKeyword(keyword).then(results => {
                    // Add sponsored products <> keyword to the DB
                    resolve({
                        data: results
                    });
                });
            }
            resolve(response);
        });
    });
}

// Add sponsored products by keyword
function addSponsoredProductsByKeyword(keyword, productASINs) {
    return new Promise((resolve, reject) => {
        DAL.addSponsoredProductsByKeyword(keyword, productASINs).then(
            response => {
                resolve(response);
            }
        );
    });
}

// Monitor keyword
function monitorKeyword(keyword) {
    return new Promise((resolve, reject) => {
        keywordMonitor.monitorKeyword(keyword).then(keywordJson => {
            addSponsoredProductsByKeyword(
                keyword,
                keywordJson.sponsoredProducts
            ).then(results => {
                resolve(results);
            });
        });
    });
}

module.exports = {
    monitorKeyword: monitorKeyword,
    addSponsoredProductsByKeyword: addSponsoredProductsByKeyword,
    getSponsoredProductsByKeyword: getSponsoredProductsByKeyword,
    getSponsoredKeywordsByProductASIN: getSponsoredKeywordsByProductASIN,
    addProduct: addProduct,
    getProduct: getProduct,
    addKeyword: addKeyword,
    getAllKeywords: getAllKeywords,
    checkConnection: checkConnection
};
