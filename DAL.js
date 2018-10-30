// NPM Packages
const { Pool, Client } = require("pg");
const moment = require("moment");
// Adjusti.co packages
const asyncForEach = require("./asyncForEach.js");
const postgresql = require("./postgresql.json");
// Constants
const connectionString = postgresql.connectionString;
const client = new Client({
    connectionString: connectionString
});

// const pool = new Pool({
//     connectionString: connectionString
// });

// pool.query("SELECT * FROM keywords", (err, res) => {
//     console.log("1", res);
//     pool.end();
// });
checkConnection();
// deleteKeyword("grass fed whey protein powder");

function checkConnection() {
    return new Promise((resolve, reject) => {
        client.connect().then(function(err) {
            if (err) {
                console.log("not able to get connection " + err);
                resolve({
                    success: false,
                    data: err
                });
            }
            resolve({
                success: true
            });
        });
    });
}

/*** KEYWORDS SECTION ***/

function getAllKeywords() {
    return new Promise((resolve, reject) => {
        client.query(`SELECT keyword FROM keywords`, (err, result) => {
            if (err) {
                console.log("not able to get connection " + err);
                resolve({
                    success: false,
                    data: err
                });
            }

            resolve({
                success: true,
                data: result.rows
            });
        });
    });
}

function getKeyword(keyword) {
    return new Promise((resolve, reject) => {
        client.query(
            `SELECT * FROM keywords WHERE keyword = '${keyword}'`,
            (err, result) => {
                if (err) {
                    console.log("not able to get connection " + err);
                    resolve({
                        success: false,
                        data: err
                    });
                }
                if (result.rows.length > 0) {
                    resolve({
                        success: true,
                        data: result.rows[0]
                    });
                } else {
                    resolve({
                        success: true,
                        data: []
                    });
                }
            }
        );
    });
}

function deleteKeyword(keyword) {
    return new Promise((resolve, reject) => {
        client.query(
            `DELETE FROM keywords WHERE keyword = '${keyword}'`,
            (err, result) => {
                if (err) {
                    console.log("not able to get connection " + err);
                    resolve({
                        success: false,
                        data: err
                    });
                }
                if (result.rows.length > 0) {
                    resolve({
                        success: true,
                        data: result.rows[0]
                    });
                } else {
                    resolve({
                        success: true,
                        data: []
                    });
                }
            }
        );
    });
}

function addKeyword(keyword) {
    return new Promise((resolve, reject) => {
        client.query(
            `INSERT INTO keywords VALUES ('${keyword}')`,
            (err, result) => {
                if (err) {
                    console.log("not able to get connection " + err);
                    resolve({
                        success: false,
                        data: err
                    });
                }

                resolve({
                    success: true,
                    data: result
                });
            }
        );
    });
}

/*** PRODUCTS SECTION ***/

function getAllProducts() {
    return new Promise((resolve, reject) => {
        client.query(`SELECT * FROM products`, (err, result) => {
            if (err) {
                console.log("not able to get connection " + err);
                resolve({
                    success: false,
                    data: err
                });
            }

            resolve({
                success: true,
                data: result.rows
            });
        });
    });
}

function getProduct(productASIN) {
    return new Promise((resolve, reject) => {
        client.query(
            `SELECT * FROM products WHERE ASIN = '${productASIN}'`,
            (err, result) => {
                if (err) {
                    console.log("not able to get connection " + err);
                    resolve({
                        success: false,
                        data: err
                    });
                }
                if (result.rows.length > 0) {
                    resolve({
                        success: true,
                        data: result.rows[0]
                    });
                } else {
                    resolve({
                        success: true,
                        data: []
                    });
                }
            }
        );
    });
}

function addProduct(product) {
    return new Promise((resolve, reject) => {
        client.query(
            `INSERT INTO products VALUES (
                '${product.ASIN}', 
                '${product.name.replace(/'/g, "''")}',
                '${product.brand}',
                '${product.mainImage}',
                '${product.rate}',
                '${product.numberOfReviews}',
                '${product.price}',
                '${product.cupon}')`,
            (err, result) => {
                if (err) {
                    console.log("not able to get connection " + err);
                    resolve({
                        success: false,
                        data: err
                    });
                }

                resolve({
                    success: true,
                    data: result
                });
            }
        );
    });
}

/*** BRANDS SECTION ***/

function getAllBrands() {
    return new Promise((resolve, reject) => {
        client.query(`SELECT * FROM brands`, (err, result) => {
            if (err) {
                console.log("not able to get connection " + err);
                resolve({
                    success: false,
                    data: err
                });
            }

            resolve({
                success: true,
                data: result.rows
            });
        });
    });
}

function getBrandByName(brandName) {
    return new Promise((resolve, reject) => {
        client.query(
            `SELECT * FROM brands WHERE name = '${brandName}'`,
            (err, result) => {
                if (err) {
                    console.log("not able to get connection " + err);
                    resolve({
                        success: false,
                        data: err
                    });
                }
                if (result.rows.length > 0) {
                    resolve({
                        success: true,
                        data: result.rows[0]
                    });
                } else {
                    resolve({
                        success: true,
                        data: []
                    });
                }
            }
        );
    });
}

function getBrandById(brandId) {
    return new Promise((resolve, reject) => {
        client.query(
            `SELECT * FROM brands WHERE id = '${brandId}'`,
            (err, result) => {
                if (err) {
                    console.log("not able to get connection " + err);
                    resolve({
                        success: false,
                        data: err
                    });
                }
                if (result.rows.length > 0) {
                    resolve({
                        success: true,
                        data: result.rows[0]
                    });
                } else {
                    resolve({
                        success: true,
                        data: []
                    });
                }
            }
        );
    });
}

function addBrand(brandName) {
    return new Promise((resolve, reject) => {
        client.query(
            `INSERT INTO brands VALUES (
                DEFAULT, 
                '${brandName.replace("'", "''")}')`,
            (err, result) => {
                if (err) {
                    console.log("not able to get connection " + err);
                    resolve({
                        success: false,
                        data: err
                    });
                }
                getBrandByName(brandName).then(brand => {
                    resolve({
                        success: true,
                        data: brand
                    });
                });
            }
        );
    });
}

function getSponsoredKeywordsByProductASIN(productASIN) {
    return new Promise((resolve, reject) => {
        client.query(
            `SELECT * FROM keywords_products WHERE productASIN = '${productASIN}'`,
            (err, result) => {
                if (err) {
                    console.log("not able to get connection " + err);
                    resolve({
                        success: false,
                        data: err
                    });
                }

                resolve({
                    success: true,
                    data: result.rows
                });
            }
        );
    });
}

function getSponsoredProductsByKeyword(keyword) {
    return new Promise((resolve, reject) => {
        client.query(
            `SELECT productasin FROM keywords_products WHERE keyword = '${keyword}'`,
            (err, result) => {
                if (err) {
                    console.log("not able to get connection " + err);
                    resolve({
                        success: false,
                        data: err
                    });
                }

                resolve({
                    success: true,
                    data: result.rows
                });
            }
        );
    });
}

function checkIfProductIsSponsoredByKeyword(keyword, product) {
    return new Promise((resolve, reject) => {
        var currentDate = moment().format("YYYY-MM-DD");
        client.query(
            `SELECT * FROM keywords_products WHERE keyword = '${keyword}'
                AND productASIN = '${product.productASIN}' 
                AND position = '${product.position}'
                AND lastSeen = '${currentDate}'`,
            (err, result) => {
                if (err) {
                    console.log("not able to get connection " + err);
                    resolve({
                        success: false,
                        data: err
                    });
                }

                if (result.rows.length > 0) {
                    resolve({
                        success: true,
                        data: true
                    });
                } else {
                    resolve({
                        success: true,
                        data: false
                    });
                }
            }
        );
    });
}

// Add sponsored product by keyword
function addSponsoredProductByKeyword(keyword, product) {
    return new Promise((resolve, reject) => {
        // Check if already exists
        checkIfProductIsSponsoredByKeyword(keyword, product).then(results => {
            if (results.success && !results.data) {
                client.query(
                    `INSERT INTO keywords_products (keyword, productASIN, position) 
                    VALUES (
                        '${keyword}', 
                        '${product.ASIN}', 
                        '${product.position}')`,
                    (err, result) => {
                        if (err) {
                            console.log("not able to get connection " + err);
                            resolve({
                                success: false,
                                data: err
                            });
                        }

                        resolve({
                            success: true,
                            data: result
                        });
                    }
                );
            }
        });
    });
}

// runQuery(`DELETE FROM brands`);
// runQuery(`DELETE FROM products`);
// runQuery(`DELETE FROM keywords`);
// runQuery(`DELETE FROM keywords_products`);

// runQuery(
//     `DELETE FROM keywords_products WHERE keyword = 'adidas socks' OR keyword = 'nike socks' OR keyword = 'whey protein isolate' OR keyword = 'grass fed whey protein powder' OR keyword = 'whey protein powder'`
// );

function runQuery(query) {
    client.query(query, (err, result) => {
        if (err) {
            console.log("not able to get connection " + err);
        }
        console.log(result);
    });
}

module.exports = {
    checkConnection: checkConnection,
    getAllKeywords: getAllKeywords,
    getAllProducts: getAllProducts,
    getAllBrands: getAllBrands,
    getKeyword: getKeyword,
    addKeyword: addKeyword,
    getProduct: getProduct,
    addProduct: addProduct,
    getBrandById: getBrandById,
    getBrandByName: getBrandByName,
    addBrand: addBrand,
    getSponsoredKeywordsByProductASIN: getSponsoredKeywordsByProductASIN,
    getSponsoredProductsByKeyword: getSponsoredProductsByKeyword,
    addSponsoredProductByKeyword: addSponsoredProductByKeyword
};
