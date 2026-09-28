import express from "express";
import mongoose from "mongoose";

const router = express.Router();

/**
 * Google Shopping / Google Merchant Center Product XML Feed
 * Endpoint: /api/feed/google-merchant.xml or /feed/google-merchant.xml
 * Specifications: Google Merchant Center RSS 2.0 Specification
 */
router.get(["/google-merchant.xml", "/google-shopping.xml"], async (req, res) => {
  try {
    const baseUrl = "https://myownfresh.com";
    const Product = mongoose.models.Product || mongoose.model("Product");
    const ProductVariant = mongoose.models.ProductVariant || mongoose.model("ProductVariant");

    // Fetch all active products populated with category
    const products = await Product.find({ status: { $ne: "Inactive" } })
      .populate("category")
      .lean();

    // Fetch all active product variants
    const allVariants = await ProductVariant.find({ status: { $ne: "Inactive" } }).lean();

    const variantsByProductId = {};
    allVariants.forEach(v => {
      const pid = String(v.product);
      if (!variantsByProductId[pid]) variantsByProductId[pid] = [];
      variantsByProductId[pid].push(v);
    });

    const escapeXml = (str) => {
      if (!str) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    const cleanBranding = (text) => {
      if (!text) return "";
      return String(text)
        .replace(/100%\s*(pure|natural)?\s*/gi, "")
        .replace(/cold\s*(&|and)?\s*stone\s*pressed/gi, "Stone Pressed")
        .replace(/cold\s*pressed/gi, "Stone Pressed")
        .replace(/\s+/g, " ")
        .trim();
    };

    const itemsXml = [];

    for (const prod of products) {
      const categoryName = prod.category?.name || "Edible Oils";
      const productType = escapeXml(`Food & Beverage > Cooking Oils > Stone Pressed ${categoryName}`);
      const rawDesc = prod.shortDesc || prod.description || "Authentic traditional stone pressed edible oil extracted slowly without heat or chemical refining.";
      const description = escapeXml(cleanBranding(rawDesc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()));

      const activeVariants = variantsByProductId[String(prod._id)] || [];

      if (activeVariants.length > 0) {
        for (const variant of activeVariants) {
          const varPrice = Number(variant.salePrice || variant.price || prod.price || 0).toFixed(2);
          const varImage = escapeXml(variant.image || (variant.images && variant.images[0]) || prod.image || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png");
          const inStock = (variant.stockQuantity === undefined || variant.stockQuantity > 0);
          const availability = inStock ? "in_stock" : "out_of_stock";
          const shippingWeight = variant.shippingWeight ? `${variant.shippingWeight} kg` : "1 kg";
          const rawTitle = `${prod.name} - ${variant.name || 'Standard'}`;
          const title = escapeXml(cleanBranding(rawTitle));
          const link = escapeXml(`${baseUrl}/product/${prod._id}`);

          itemsXml.push(`
    <item>
      <g:id>${variant._id || prod._id}</g:id>
      <g:item_group_id>${prod._id}</g:item_group_id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${varImage}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${varPrice} INR</g:price>
      <g:brand>MyOwnFresh</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${productType}</g:product_type>
      <g:shipping_weight>${shippingWeight}</g:shipping_weight>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard Shipping</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`);
        }
      } else {
        const prodPrice = Number(prod.price || 0).toFixed(2);
        const prodImage = escapeXml(prod.image || "https://res.cloudinary.com/dkhq2wlwg/image/upload/v1774962822/ownfresh_media/ndxvmcpisomjzsghrfjs.png");
        const inStock = (prod.stock === undefined || prod.stock > 0);
        const availability = inStock ? "in_stock" : "out_of_stock";
        const rawTitle = prod.name || "Stone Pressed Oil";
        const title = escapeXml(cleanBranding(rawTitle));
        const link = escapeXml(`${baseUrl}/product/${prod._id}`);

        itemsXml.push(`
    <item>
      <g:id>${prod._id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${prodImage}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${prodPrice} INR</g:price>
      <g:brand>MyOwnFresh</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${productType}</g:product_type>
      <g:shipping_weight>1 kg</g:shipping_weight>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard Shipping</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`);
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>MyOwnFresh - Stone Pressed Edible Oils</title>
    <link>${baseUrl}</link>
    <description>Official Google Merchant Center Product Feed for MyOwnFresh Stone Pressed Cooking Oils.</description>
${itemsXml.join("")}
  </channel>
</rss>`;

    res.header("Content-Type", "application/xml; charset=utf-8");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Google Merchant Feed generation error:", error);
    res.status(500).send("Error generating merchant feed");
  }
});

export default router;
