const express = require("express");
const {
  create,
  list,
  listRelated,
  listCategories,
  listBySearch,
  photo,
} = require("../controllers/product");
const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const {
  productById,
  read,
  remove,
  update,
  listSearch,
} = require("../controllers/product");
const router = express.Router();

router.get("/product/:productId", read);
router.delete(
  "/product/:productId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  remove
);
router.put(
  "/product/:productId/:userId",
  requireSignin,
  isAuth,
  isAdmin,
  update
);

router.get("/products", list);
router.get("/products/search", listSearch);
router.get("/products/related/:productId", listRelated);
router.get("/products/categories", listCategories);
router.get("/product/photo/:productId", photo);
router.post("/products/by/search", listBySearch);
router.post("/product/create/:userId", requireSignin, isAuth, isAdmin, create);
router.param("userId", userById);
router.param("productId", productById);

module.exports = router;
