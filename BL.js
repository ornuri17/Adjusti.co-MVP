// NPM packages

// Adjusti.co packages
const DAL = require("./DAL.js");
const asyncForEach = require("./asyncForEach.js");
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

/*** KEYWORDS SECTION ***/

// Get all keywords
function getAllKeywords() {
    return new Promise((resolve, reject) => {
        DAL.getAllKeywords().then(response => {
            resolve(response);
        });
    });
}

// Gets keyword and returns the sponsored products
function getKeyword(keyword) {
    return new Promise((resolve, reject) => {
        checkIfKeywordExists(keyword).then(exists => {
            if (exists) {
                getSponsoredProductsByKeyword(keyword).then(
                    sponsoredProducts => {
                        resolve(sponsoredProducts);
                    }
                );
            } else {
                addKeyword(keyword).then(response => {
                    getSponsoredProductsByKeyword(keyword).then(
                        sponsoredProducts => {
                            resolve(sponsoredProducts);
                        }
                    );
                });
            }
        });
    });
}

function addKeyword(keyword) {
    return new Promise((resolve, reject) => {
        DAL.addKeyword(keyword).then(response => {
            monitorKeyword(keyword).then(() => {
                resolve(response);
            });
        });
    });
}

function checkIfKeywordExists(keyword) {
    return new Promise((resolve, reject) => {
        DAL.getKeyword(keyword).then(response => {
            if (Array.isArray(response.data)) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

// Monitor keyword
function monitorKeyword(keyword) {
    console.log("Monitoring: ", keyword);
    return new Promise((resolve, reject) => {
        keywordMonitor.monitorKeyword(keyword).then(async keywordJson => {
            if (keywordJson.sponsoredProducts != undefined) {
                // Async for each function
                const start = async () => {
                    await asyncForEach(
                        keywordJson.sponsoredProducts,
                        async sponsoreProduct => {
                            // Check if product is in the DB
                            await checkIfProductExistsByASIN(
                                sponsoreProduct.ASIN
                            ).then(async product => {
                                if (!product) {
                                    await addProduct(sponsoreProduct.ASIN).then(
                                        response => {
                                            console.log(
                                                "Added: ",
                                                sponsoreProduct.ASIN
                                            );
                                        }
                                    );
                                }
                            });
                        }
                    );
                };
                await start();
                addSponsoredProductsByKeyword(
                    keyword,
                    keywordJson.sponsoredProducts
                ).then(results => {
                    resolve(results);
                });
            } else {
                resolve();
            }
        });
    });
}

function monitorAllKeywords() {
    return new Promise((resolve, reject) => {
        getAllKeywords().then(async results => {
            var keywords = results.data;
            var response = [];
            const start = async () => {
                await asyncForEach(keywords, async keywordJson => {
                    await monitorKeyword(keywordJson.keyword).then(res => {
                        response.push(res);
                    });
                });
                resolve(response);
            };
            start();
        });
    });
}

/*** PRODUCTS SECTION ***/

// Get all keywords
function getAllProducts() {
    return new Promise((resolve, reject) => {
        DAL.getAllProducts().then(response => {
            resolve(response);
        });
    });
}

// Get product details
function getProduct(productASIN) {
    return new Promise((resolve, reject) => {
        // Check if product is in the DB
        checkIfProductExistsByASIN(productASIN).then(product => {
            if (product) {
                resolve(product);
            } else {
                addProduct(productASIN).then(product => {
                    resolve(product);
                });
            }
        });
    });
}

// Add product
function addProduct(productASIN) {
    return new Promise((resolve, reject) => {
        monitorProduct(productASIN).then(product => {
            getBrandIDByName(product.brand).then(response => {
                product.brand = response;
                DAL.addProduct(product).then(response => {
                    resolve(response.data);
                });
            });
        });
    });
}

function checkIfProductExistsByASIN(productASIN) {
    return new Promise((resolve, reject) => {
        DAL.getProduct(productASIN).then(response => {
            if (Array.isArray(response.data)) {
                resolve(false);
            } else {
                resolve(response.data);
            }
        });
    });
}

// Monitor product
function monitorProduct(productASIN) {
    return new Promise((resolve, reject) => {
        productMonitor.getProductDetails(productASIN).then(productDetails => {
            resolve(productDetails);
        });
    });
}

/*** BRANDS SECTION ***/

// Get all brands
function getAllBrands() {
    return new Promise((resolve, reject) => {
        DAL.getAllBrands().then(response => {
            resolve(response);
        });
    });
}

// Get brand details by Id
function getBrandById(brandId) {
    return new Promise((resolve, reject) => {
        // Check if brand is in the DB
        checkIfBrandExistsById(brandId).then(product => {
            if (product) {
                resolve(product);
            } else {
                // addProduct(productASIN).then(product => {
                resolve();
                // });
            }
        });
    });
}

// Get brand details by name
function getBrandIDByName(brandName) {
    return new Promise((resolve, reject) => {
        // Check if brand is in the DB
        checkIfBrandExistsByName(brandName).then(brandJson => {
            if (brandJson) {
                resolve(brandJson.id);
            } else {
                addBrand(brandName).then(response => {
                    resolve(response.data.id);
                });
            }
        });
    });
}

// Add brand
function addBrand(brandName) {
    return new Promise((resolve, reject) => {
        if (brandName != "") {
            DAL.addBrand(brandName).then(brand => {
                resolve(brand.data);
            });
        } else {
            resolve(brandName);
        }
    });
}

function checkIfBrandExistsById(brandId) {
    return new Promise((resolve, reject) => {
        DAL.getBrandById(brandId).then(response => {
            if (Array.isArray(response.data)) {
                resolve(false);
            } else {
                resolve(response.data);
            }
        });
    });
}

function checkIfBrandExistsByName(brandName) {
    return new Promise((resolve, reject) => {
        DAL.getBrandByName(brandName).then(response => {
            if (Array.isArray(response.data)) {
                resolve(false);
            } else {
                resolve(response.data);
            }
        });
    });
}

/*** KEYWORDS <> SPONSORED PRODUCTS SECTION ***/

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
            resolve(response);
        });
    });
}

// Add sponsored products by keyword
function addSponsoredProductByKeyword(keyword, product) {
    return new Promise((resolve, reject) => {
        DAL.addSponsoredProductByKeyword(keyword, product).then(response => {
            resolve(response);
        });
    });
}

// Add sponsored products by keyword
function addSponsoredProductsByKeyword(keyword, products) {
    return new Promise((resolve, reject) => {
        var success = true;
        const start = async () => {
            await asyncForEach(products, async product => {
                await addSponsoredProductByKeyword(keyword, product).then(
                    results => {
                        success = success && results.success;
                    }
                );
            });
        };
        start();
        resolve({
            success: success
        });
    });
}

module.exports = {
    monitorKeyword: monitorKeyword,
    monitorAllKeywords: monitorAllKeywords,
    addSponsoredProductByKeyword: addSponsoredProductByKeyword,
    addSponsoredProductsByKeyword: addSponsoredProductsByKeyword,
    getSponsoredProductsByKeyword: getSponsoredProductsByKeyword,
    getSponsoredKeywordsByProductASIN: getSponsoredKeywordsByProductASIN,
    addProduct: addProduct,
    getProduct: getProduct,
    getKeyword: getKeyword,
    getAllKeywords: getAllKeywords,
    getAllProducts: getAllProducts,
    checkConnection: checkConnection
};
