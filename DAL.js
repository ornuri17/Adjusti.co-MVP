// NPM Packages
const { Pool, Client } = require("pg");
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

function getAllKeywords() {
    return new Promise((resolve, reject) => {
        client.query(`SELECT * FROM keywords`, (err, result) => {
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

                resolve({
                    success: true,
                    data: result.rows[0]
                });
            }
        );
    });
}

function addProduct(product) {
    return new Promise((resolve, reject) => {
        client.query(
            `INSERT INTO products VALUES (
                '${product.productASIN}', 
                '${product.name}',
                '${product.brand}',
                '${product.mainImage}',
                '${product.rate}',
                '${product.numberOfReviews}')`,
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
            `SELECT * FROM keywords_products WHERE keyword = '${keyword}'`,
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

function checkIfProductIsSponsoredByKeyword(keyword, productASIN) {
    return new Promise((resolve, reject) => {
        client.query(
            `SELECT * FROM keywords_products WHERE keyword = '${keyword}' AND productASIN = '${productASIN}'`,
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
                }
                resolve({
                    success: true,
                    data: false
                });
            }
        );
    });
}

// Add sponsored product by keyword
function addSponsoredProductByKeyword(keyword, productASIN) {
    return new Promise((resolve, reject) => {
        // Check if already exists
        checkIfProductIsSponsoredByKeyword(keyword, productASIN).then(
            results => {
                if (results.success && !results.data) {
                    client.query(
                        `INSERT INTO keywords_products VALUES ('${keyword}', '${productASIN}')`,
                        (err, result) => {
                            if (err) {
                                console.log(
                                    "not able to get connection " + err
                                );
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
            }
        );
    });
}

// Add sponsored products by keyword
function addSponsoredProductsByKeyword(keyword, productASINs) {
    return new Promise((resolve, reject) => {
        var success = true;
        const start = async () => {
            await asyncForEach(productASINs, productASIN => {
                addSponsoredProductByKeyword(keyword, productASIN).then(
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
    checkConnection: checkConnection,
    getAllKeywords: getAllKeywords,
    addKeyword: addKeyword,
    getProduct: getProduct,
    addProduct: addProduct,
    getSponsoredKeywordsByProductASIN: getSponsoredKeywordsByProductASIN,
    getSponsoredProductsByKeyword: getSponsoredProductsByKeyword,
    addSponsoredProductsByKeyword: addSponsoredProductsByKeyword
};
