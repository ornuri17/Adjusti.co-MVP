// Properties
// NPM Packages
const rp = require("request-promise");
const cheerio = require("cheerio");
const util = require("util");
// Adjusti.co Packages
var productMonitor = require("./productMonitor.js");
var asyncForEach = require("./asyncForEach.js");
const selectors = require("./selectors.json");
const urls = require("./urls.json");

// monitorKeyword("airpods case").then(a => {
//     console.log(a);
// });

function monitorKeyword(keyword) {
    return new Promise((resolve, reject) => {
        const options = {
            uri: urls.searchPage + keyword,
            transform: async function(body) {
                return await cheerio.load(body);
            }
        };

        rp(options)
            .then(async $ => {
                var keywordJson = {};
                // var sponsoredBrandJson = await getSponsoredBrandDetails($);
                var sponsoredProductsJson = await getSponsoredProductsDetails(
                    $
                );
                // if (sponsoredBrandJson != false) {
                //     keywordJson.sponsoredBrand = sponsoredBrandJson;
                // }
                if (sponsoredProductsJson != false) {
                    keywordJson.sponsoredProducts = sponsoredProductsJson;
                }
                resolve(keywordJson);
            })
            .catch(err => {
                console.log(err);
            });
    });
}

async function getSponsoredBrandDetails($) {
    // Check if there is a sponsored brand
    if ($(selectors.searchPage.sponsoredBrand.brandName).text() != "") {
        var brandName = $(selectors.searchPage.sponsoredBrand.brandName).text();
        var adHeadline = $(
            selectors.searchPage.sponsoredBrand.adHeadline
        ).text();
        var productsBlocks = $(
            selectors.searchPage.sponsoredBrand.productsBlock
        ).children();
        var productsImages = [];
        await productsBlocks.each(function(i, element) {
            productsImages.push(
                $(this)
                    .find(
                        selectors.searchPage.sponsoredBrand.productsImagesClass
                    )
                    .attr("src")
            );
        });
        var firstProductDesc = $(
            selectors.searchPage.sponsoredBrand.firstProductDesc
        ).text();
        var secondProductDesc = $(
            selectors.searchPage.sponsoredBrand.secondProductDesc
        ).text();
        var thirdProductDesc = $(
            selectors.searchPage.sponsoredBrand.thirdProductDesc
        ).text();

        var sponsoredBrandJson = {
            brandName: brandName,
            adHeadline: adHeadline,
            firstProduct: {
                desc: firstProductDesc,
                image: productsImages[0]
            },
            secondProduct: {
                desc: secondProductDesc,
                image: productsImages[1]
            },
            thirdProduct: {
                desc: thirdProductDesc,
                image: productsImages[2]
            }
        };

        return sponsoredBrandJson;
    } else {
        return false;
    }
}

function getSponsoredProductsDetails($) {
    return new Promise(async (resolve, reject) => {
        if (
            $(selectors.searchPage.sponsoredProducts.sponsoredProductsBlocks)
                .length > 0
        ) {
            var sponsoredProductsArray = [];
            var sponsoredProductsASINsArray = [];
            await $(
                selectors.searchPage.sponsoredProducts.sponsoredProductsBlocks
            ).each(async function(i, sponsoredProduct) {
                var lookFor = "dp%2F";
                var productASIN = $(this)
                    .find(selectors.searchPage.sponsoredProducts.ASIN)
                    .attr("href");
                if (productASIN === undefined) {
                    resolve(false);
                }
                productASIN = productASIN.substring(
                    productASIN.indexOf(lookFor) + lookFor.length
                );
                productASIN = productASIN.substring(
                    0,
                    productASIN.indexOf("%2F")
                );
                sponsoredProductsASINsArray.push(productASIN);
            });
            // const start = async () => {
            //     await asyncForEach(
            //         sponsoredProductsASINsArray,
            //         async element => {
            //             sponsoredProductsArray.push(
            //                 await productMonitor.getProductDetails(element)
            //             );
            //         }
            //     );
            // };
            // await start();
            // resolve(sponsoredProductsArray);
            resolve(sponsoredProductsASINsArray);
        } else {
            resolve(false);
        }
    });
}

module.exports = {
    monitorKeyword: monitorKeyword
};
