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

// getProductDetails("B01G3JYVYM").then((a) => { console.log(a) });

// **PRIVATE**
// Gets an ASIN, retrieves the product page HTML and runs a callback
function getProductPageHTMLWithCallback(ASIN, callback) {
    return new Promise((resolve, reject) => {
        resolve(getHTMLByURLWithCallback(urls.productPage + ASIN, callback));
    });
}

// **PUBLIC**
// Gets an ASIN and returns the product details
function getProductDetails(ASIN) {
    return new Promise((resolve, reject) => {
        resolve(
            getProductPageHTMLWithCallback(ASIN, getProductDetailsFromHTML)
        );
    });
}

// **PUBLIC**
// Gets an array of ASINs and returns products' details
async function getProductsDetails(ASINs) {
    return new Promise(async (resolve, reject) => {
        var productsDetails = [];
        const start = async () => {
            await asyncForEach(ASINs, async ASIN => {
                productsDetails.push(await getProductDetails(ASIN));
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
function getProductDetailsFromHTML($) {
    return new Promise(async (resolve, reject) => {
        var productDetails = await {
            name: await getProductNameFromHTML($),
            brand: await getProductBrandFromHTML($),
            mainImage: await getProductMainImageFromHTML($),
            rate: await getProductRateFromHTML($),
            numberOfReviews: await getProductNumberOfReviewsFromHTML($),
            ASIN: await getProductASINFromHTML($)
        };
        resolve(productDetails);
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's brand
function getProductBrandFromHTML($) {
    return new Promise((resolve, reject) => {
        var productBrandName = $(selectors.productPage.brand.name).text();
        var productBrandLogo = $(selectors.productPage.brand.logo).attr("src");
        if (productBrandName != "") {
            resolve(productBrandName);
        } else if (productBrandLogo != undefined) {
            resolve(productBrandLogo);
        } else {
            resolve($(selectors.productPage.brand.logoByLine).attr("src"));
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
        resolve($(selectors.productPage.mainImage).attr("src"));
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's ASIN
function getProductASINFromHTML($) {
    return new Promise((resolve, reject) => {
        resolve($(selectors.productPage.ASIN).attr("data-asin"));
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's rate
function getProductRateFromHTML($) {
    return new Promise((resolve, reject) => {
        resolve($(selectors.productPage.rate).text());
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's rate
function getProductNumberOfReviewsFromHTML($) {
    return new Promise((resolve, reject) => {
        resolve($(selectors.productPage.numberOfReviews).text());
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

module.exports = {
    getProductDetails: getProductDetails,
    getProductBrand: getProductBrand,
    getProductSponsoredRelatedProducts: getProductSponsoredRelatedProducts
};
