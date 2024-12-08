const ProductService = require("../services/ProductService");
const Product = require("../models/ProductModel");

const createProduct = async (req, res) => {
  try {
    const { name, image, type, countInStock, price, rating, description, discount } = req.body;
    if (!name || !image || !type || !countInStock || !price || !rating || !discount || !description) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is required",
      });
    }
    const response = await ProductService.createProduct(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const data = req.body;
    if (!productId) {
      return res.status(400).json({
        status: "ERR",
        message: "The productId is required",
      });
    }
    const response = await ProductService.updateProduct(productId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getDetailsProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({
        status: "ERR",
        message: "The productId is required",
      });
    }
    const response = await ProductService.getDetailsProduct(productId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({
        status: "ERR",
        message: "The productId is required",
      });
    }
    const response = await ProductService.deleteProduct(productId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const deleteMany = async (req, res) => {
  try {
    const ids = req.body.ids;
    if (!ids) {
      return res.status(400).json({
        status: "ERR",
        message: "The ids is required",
      });
    }
    const response = await ProductService.deleteManyProduct(ids);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getAllProduct = async (req, res) => {
  try {
    const limit = Math.max(Number(req.query.limit) || 100, 1);
    const page = Math.max(Number(req.query.page) || 0, 0);
    const { sort, filter } = req.query;

    const response = await ProductService.getAllProduct(limit, page, sort, filter);
    return res.status(200).json(response);
  } catch (e) {
    console.error("Error fetching products:", e);
    return res.status(500).json({
      message: "Failed to fetch products. Please try again later.",
    });
  }
};

const getAllType = async (req, res) => {
  try {
    const response = await ProductService.getAllType();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};
// Hàm tính điểm tương tự dựa trên từ khóa (Levenshtein Distance)
const calculateSimilarity = (str1, str2) => {
  const lev = require("fast-levenshtein");
  return lev.get(str1.toLowerCase(), str2.toLowerCase());
};

const getSuggestions = async (req, res) => {
  try {
    const search = req.query.search || "";

    // Nếu từ khóa rỗng, trả về sản phẩm phổ biến
    if (!search) {
      const popularProducts = await Product.find().sort({ selled: -1 }).limit(10);
      return res.status(200).json({ status: "OK", data: popularProducts });
    }

    // Tìm sản phẩm dựa trên từ khóa
    const products = await Product.find();

    // Tính điểm tương tự và lọc các sản phẩm liên quan
    const suggestions = products
      .map((product) => ({
        ...product._doc,
        similarity: calculateSimilarity(search, product.name),
      }))
      .filter((product) => product.similarity <= 5) // Độ sai lệch <= 5 ký tự
      .sort((a, b) => a.similarity - b.similarity) // Sắp xếp theo độ giống
      .slice(0, 10); // Lấy tối đa 10 gợi ý

    // Nếu không có gợi ý liên quan, trả về sản phẩm phổ biến
    if (suggestions.length === 0) {
      const popularProducts = await Product.find().sort({ selled: -1 }).limit(10);
      return res.status(200).json({ status: "OK", data: popularProducts });
    }

    // Trả về danh sách gợi ý
    return res.status(200).json({ status: "OK", data: suggestions });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return res.status(500).json({ status: "FAILED", message: "Server error" });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getDetailsProduct,
  deleteProduct,
  getAllProduct,
  deleteMany,
  getAllType,
  getSuggestions,
};
