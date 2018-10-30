// NPM Packages
const rp = require("request-promise");
const fsc = require("fs-cheerio");
const cheerio = require("cheerio");
// Adjusti.co Packages
const selectors = require("./selectors.json");
const urls = require("./urls.json");
var asyncForEach = require("./asyncForEach.js");
var getHTMLByURLWithCallback = require("./getHTMLByURLWithCallback.js");

// function local() {
// 	return new Promise((resolve, reject) => {
// 		fsc.readFile(__dirname + "/product.html").then(async function ($) {
// 			resolve(await getSponsoredRelatedProductsFromHTML($));
// 		});
// 	})
// }

// **PRIVATE**
// Gets an ASIN, retrieves the product page HTML and runs a callback
function getProductPageHTMLWithCallback(ASIN, callback) {
    return new Promise((resolve, reject) => {
        resolve(
            getHTMLByURLWithCallback(urls.productPage + ASIN, callback, ASIN)
        );
    });
}

// **PUBLIC**
// Gets an ASIN and returns the product details
function getProductDetails(productASIN) {
    return new Promise((resolve, reject) => {
        console.log("Adding product ASIN : ", productASIN);
        resolve(
            getProductPageHTMLWithCallback(
                productASIN,
                getProductDetailsFromHTML
            )
        );
    });
}

// **PUBLIC**
// Gets an array of ASINs and returns products' details
async function getProductsDetails(products) {
    return new Promise(async (resolve, reject) => {
        var productsDetails = [];
        const start = async () => {
            await asyncForEach(products, async product => {
                productsDetails.push(await getProductDetails(product.ASIN));
            });
        };
        await start();
        resolve(productsDetails);
    });
}

// **PUBLIC**
// Gets and ASIN and returns the product brand
function getProductBrand(ASIN) {
    return new Promise((resolve, reject) => {
        resolve(getProductPageHTMLWithCallback(ASIN, getProductBrandFromHTML));
    });
}

// **PUBLIC**
// Gets an ASIN and returns sponsored related products
function getProductSponsoredRelatedProducts(ASIN) {
    return new Promise((resolve, reject) => {
        resolve(
            getProductPageHTMLWithCallback(
                ASIN,
                getSponsoredRelatedProductsFromHTML
            )
        );
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's details
function getProductDetailsFromHTML($, productASIN) {
    return new Promise(async (resolve, reject) => {
        var productDetails = await {
            // ASIN: await getProductASINFromHTML($),
            ASIN: productASIN,
            name: await getProductNameFromHTML($),
            mainImage: await getProductMainImageFromHTML($),
            rate: await getProductRateFromHTML($),
            numberOfReviews: await getProductNumberOfReviewsFromHTML($),
            price: await getProductPriceFromHTML($),
            cupon: await getProducCuponFromHTML($)
        };
        productDetails.brand = await getProductBrandFromHTML(
            $,
            productDetails.ASIN
        );
        resolve(productDetails);
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's brand
function getProductBrandFromHTML($, productASIN) {
    return new Promise((resolve, reject) => {
        var productBrandName = $(selectors.productPage.brand.name).text();
        var productBrandName2 = $(selectors.productPage.brand.name2).attr(
            "href"
        );
        if (productBrandName2 != undefined) {
            productBrandName2.substring(1);
            productBrandName2 = productBrandName2.substring(
                0,
                productBrandName2.indexOf("/")
            );
        }

        if (productBrandName != undefined && productBrandName != "") {
            resolve(productBrandName);
        } else if (productBrandName2 != undefined && productBrandName2 != "") {
            resolve(productBrandName2);
        } else {
            getProductBrandWithSize(productASIN).then(productBrandName => {
                resolve(productBrandName);
            });
        }
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's name
function getProductNameFromHTML($) {
    return new Promise((resolve, reject) => {
        resolve(
            $(selectors.productPage.name)
                .text()
                .trim()
        );
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's main image
function getProductMainImageFromHTML($) {
    return new Promise((resolve, reject) => {
        var mainImage = $(selectors.productPage.image.main).attr(
            "data-old-hires"
        );
        if (mainImage == "") {
            mainImage = $(selectors.productPage.image.main2).attr("src");
        }
        resolve(mainImage);
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's ASIN
function getProductASINFromHTML($) {
    return new Promise((resolve, reject) => {
        var ASIN = $(selectors.productPage.ASIN).attr("value");
        if (ASIN == undefined || ASIN == "") {
            ASIN = $("#detail-bullets").find("li")[1].children[1].data;
        }
        resolve(ASIN);
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's rate
function getProductRateFromHTML($) {
    return new Promise((resolve, reject) => {
        var rate = $(selectors.productPage.rate).text();
        rate = rate.substring(0, rate.indexOf("stars") + 5);
        if (rate == "") {
            rate = "No rate";
        }
        resolve(rate);
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's rate
function getProductNumberOfReviewsFromHTML($) {
    return new Promise((resolve, reject) => {
        var numberOfReviews = $(selectors.productPage.numberOfReviews).text();
        numberOfReviews = numberOfReviews
            .substring(0, numberOfReviews.indexOf(" "))
            .replace(",", "");
        if (numberOfReviews == "") {
            numberOfReviews = 0;
        }
        resolve(numberOfReviews);
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's price
function getProductPriceFromHTML($) {
    return new Promise((resolve, reject) => {
        var price = $(selectors.productPage.price).text();
        if (price == undefined || price == "") {
            price = $(selectors.productPage.price2).text();
        }
        resolve(price);
    });
}

// **PRIVATE**
// Gets product page HTML and returns if the product has cupon
function getProducCuponFromHTML($) {
    return new Promise((resolve, reject) => {
        var cuponText = $(selectors.productPage.cupon).text();
        if (cuponText != undefined && cuponText != "") {
            // Check whether the discount is in dollars or percent
            var indexOfPercentSynbol = cuponText.indexOf("%");
            var indexOfDollarSynbol = cuponText.indexOf("$");
            if (indexOfPercentSynbol != -1) {
                cuponText = cuponText
                    .substring(indexOfPercentSynbol - 2, 3)
                    .trim();
            } else {
                cuponText = cuponText
                    .substring(indexOfDollarSynbol, indexOfDollarSynbol + 5)
                    .trim();
            }
        } else {
            cuponText = "None";
        }
        resolve(cuponText);
    });
}

// **PRIVATE**
// Gets product page HTML and returns the sponsored related products
function getSponsoredRelatedProductsFromHTML($) {
    return new Promise(async (resolve, reject) => {
        var firstCarouselProducts = [];
        var secondCarouselProducts = [];

        // First carousel
        var sponsoredRelatedProductsASINsString = $(
            selectors.productPage.firstSponsoredRelatedProductsCarousel
        ).attr("data-a-carousel-options");
        if (sponsoredRelatedProductsASINsString != undefined) {
            var sponsoredRelatedProductsASINsArray = JSON.parse(
                sponsoredRelatedProductsASINsString
            ).initialSeenAsins;
            firstCarouselProducts = await getProductsDetails(
                sponsoredRelatedProductsASINsArray
            );
        }

        // Second carousel
        sponsoredRelatedProductsASINsString = $(
            selectors.productPage.secondSponsoredRelatedProductsCarousel
        ).attr("data-a-carousel-options");
        if (sponsoredRelatedProductsASINsString != undefined) {
            var sponsoredRelatedProductsASINsArray = JSON.parse(
                sponsoredRelatedProductsASINsString
            ).initialSeenAsins;
            secondCarouselProducts = await getProductsDetails(
                sponsoredRelatedProductsASINsArray
            );
        }

        resolve({
            firstCarouselProducts: firstCarouselProducts,
            secondCarouselProducts: secondCarouselProducts
        });
    });
}

function getProductBrandWithSize(productASIN) {
    return new Promise((resolve, reject) => {
        const options = {
            uri:
                urls.productPage +
                productASIN +
                urls.chooseSizeForProductPageURL,
            transform: async function(body) {
                return await cheerio.load(body);
            }
        };

        rp(options)
            .then(async $ => {
                getProductBrandWithSizeFromHTML($, productASIN).then(
                    brandName => {
                        resolve(brandName);
                    }
                );
            })
            .catch(err => {
                console.log(err);
            });
    });
}

function getProductBrandWithSizeFromHTML($, productASIN) {
    return new Promise((resolve, reject) => {
        var productBrandName = $(selectors.productPage.brand.name).text();
        var productBrandName2 = $(selectors.productPage.brand.name2).attr(
            "href"
        );
        if (productBrandName2 != undefined) {
            productBrandName2.substring(1);
            productBrandName2 = productBrandName2.substring(
                0,
                productBrandName2.indexOf("/")
            );
        }

        if (productBrandName != undefined && productBrandName != "") {
            resolve(productBrandName);
        } else {
            resolve(productBrandName2);
        }
    });
}

module.exports = {
    getProductDetails: getProductDetails,
    getProductBrand: getProductBrand,
    getProductSponsoredRelatedProducts: getProductSponsoredRelatedProducts
};
