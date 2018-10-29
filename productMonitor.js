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
        resolve(getHTMLByURLWithCallback(urls.productPage + ASIN, callback));
    });
}

// **PUBLIC**
// Gets an ASIN and returns the product details
function getProductDetails(productASIN) {
    return new Promise((resolve, reject) => {
        console.log("ASIN : ", productASIN);
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
function getProductDetailsFromHTML($) {
    return new Promise(async (resolve, reject) => {
        var productDetails = await {
            ASIN: await getProductASINFromHTML($),
            name: await getProductNameFromHTML($),
            mainImage: await getProductMainImageFromHTML($),
            rate: await getProductRateFromHTML($),
            numberOfReviews: await getProductNumberOfReviewsFromHTML($),
            price: await getProductPriceFromHTML($),
            cupon: await getProducCuponFromHTML($)
        };
        productDetails.brand = await getProductBrandFromHTML(
            $,
            productDetails.name,
            productDetails.ASIN
        );
        resolve(productDetails);
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's brand
function getProductBrandFromHTML($, productName, productASIN) {
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
            getBrandNameOfSpecificProduct(productName, productASIN).then(
                productBrandName => {
                    resolve(productBrandName);
                }
            );
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
        resolve($(selectors.productPage.mainImage).attr("data-old-hires"));
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's ASIN
function getProductASINFromHTML($) {
    return new Promise((resolve, reject) => {
        resolve($(selectors.productPage.ASIN).attr("value"));
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's rate
function getProductRateFromHTML($) {
    return new Promise((resolve, reject) => {
        var rate = $(selectors.productPage.rate).text();
        rate = rate.substring(0, rate.indexOf("stars") + 5);
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
        resolve(numberOfReviews);
    });
}

// **PRIVATE**
// Gets product page HTML and returns the product's price
function getProductPriceFromHTML($) {
    return new Promise((resolve, reject) => {
        resolve($(selectors.productPage.price).text());
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

// getBrandNameOfSpecificProduct(
//     "MusclePharm Combat Protein Powder",
//     "B003BVI5FW"
// ).then(a => {
//     console.log(a);
// });

function getBrandNameOfSpecificProduct(productName, productASIN) {
    return new Promise((resolve, reject) => {
        const options = {
            uri: urls.searchPage + productName,
            transform: async function(body) {
                return await cheerio.load(body);
            }
        };

        rp(options)
            .then(async $ => {
                getBrandNameOfSpecificProductFromHTML($, productASIN).then(
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

function getBrandNameOfSpecificProductFromHTML($, productASIN) {
    return new Promise((resolve, reject) => {
        var brandName = $(
            selectors.searchPage.sponsoredProducts.brandNamePrefix +
                productASIN +
                selectors.searchPage.sponsoredProducts.brandNameSuffix
        );
        brandName = brandName.text().substring(3);
        console.log(brandName);
        resolve(brandName);
    });
}

module.exports = {
    getProductDetails: getProductDetails,
    getProductBrand: getProductBrand,
    getProductSponsoredRelatedProducts: getProductSponsoredRelatedProducts
};
