import axios from "axios";

const WP_PRODUCT_API = "https://myownfresh.com/wp-json/wp/v2/product";

const testApi = async () => {
    try {
        const res = await axios.get(WP_PRODUCT_API + "?per_page=1");
        console.log("SUCCESS! Found products via wp/v2/product");
        console.log(JSON.stringify(res.data[0], null, 2));
    } catch (error) {
        console.log("FAILED via wp/v2/product. Trying wc/v3 (likely needs auth)");
        try {
            const res2 = await axios.get("https://myownfresh.com/wp-json/wc/v3/products");
            console.log("SUCCESS via wc/v3/products");
        } catch (error2) {
            console.log("FAILED via wc/v3 as well.");
            console.log("Error status:", error.response?.status || error.message);
        }
    }
};

testApi();
