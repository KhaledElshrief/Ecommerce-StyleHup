import { Link, useLocation, useNavigate } from "react-router-dom";
import "./product.css";
import Chart from "../../components/chart/Chart";
import { Publish } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { updateProduct } from "../../redux/apiCalls";
import { userRequest } from "../../requestMethods";

export default function Product() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const productId = location.pathname.split("/")[2];
  const [pStats, setPStats] = useState([]);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const product = useSelector((state) =>
    state.product.products.find((item) => item._id === productId)
  );

  const MONTHS = useMemo(
    () => [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Agu", "Sep", "Oct", "Nov", "Dec",
    ],
    []
  );

  useEffect(() => {
    if (!product) return;
    setForm({
      title: product.title || "",
      desc: product.desc || "",
      price: product.price ?? "",
      inStock: String(product.inStock !== false),
      categories: (product.categories || []).join(","),
    });
  }, [product]);

  useEffect(() => {
    const getStats = async () => {
      try {
        const res = await userRequest.get("orders/income?pid=" + productId);
        const list = res.data.sort((a, b) => a._id - b._id);
        setPStats(list.map((item) => ({
          name: MONTHS[item._id - 1],
          Sales: item.total,
        })));
      } catch (err) {
        console.log(err);
      }
    };
    getStats();
  }, [productId, MONTHS]);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    const update = new FormData();
    update.append("title", form.title);
    update.append("desc", form.desc);
    update.append("price", form.price);
    update.append("inStock", form.inStock);
    update.append(
      "categories",
      JSON.stringify(form.categories.split(",").map((item) => item.trim()).filter(Boolean))
    );
    if (file) update.append("image", file);

    try {
      await updateProduct(productId, update, dispatch);
      navigate("/products");
    } catch (requestError) {
      setError(
        requestError.response?.status === 409
          ? "A product with this title already exists."
          : "The product could not be updated."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!product || !form) return <div className="product">Loading product...</div>;

  return (
    <div className="product">
      <div className="productTitleContainer">
        <h1 className="productTitle">Product</h1>
        <Link to="/newproduct">
          <button className="productAddButton">Create</button>
        </Link>
      </div>
      <div className="productTop">
        <div className="productTopLeft">
          <Chart data={pStats} dataKey="Sales" title="Sales Performance" />
        </div>
        <div className="productTopRight">
          <div className="productInfoTop">
            <img src={product.img} alt="" className="productInfoImg" />
            <span className="productName">{product.title}</span>
          </div>
          <div className="productInfoBottom">
            <div className="productInfoItem">
              <span className="productInfoKey">id:</span>
              <span className="productInfoValue">{product._id}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">sales:</span>
                <span className="productInfoValue">
                  {pStats.reduce((total, item) => total + Number(item.Sales || 0), 0)}
                </span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">in stock:</span>
              <span className="productInfoValue">{product.inStock ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="productBottom">
        <form className="productForm" onSubmit={handleUpdate}>
          <div className="productFormLeft">
            <label>Product Name</label>
            <input name="title" type="text" value={form.title} onChange={handleChange} />
            <label>Product Description</label>
            <input name="desc" type="text" value={form.desc} onChange={handleChange} />
            <label>Price</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} />
            <label>Categories</label>
            <input name="categories" type="text" value={form.categories} onChange={handleChange} />
            <label>In Stock</label>
            <select name="inStock" value={form.inStock} onChange={handleChange}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="productFormRight">
            <div className="productUpload">
              <img src={product.img} alt="" className="productUploadImg" />
              <label htmlFor="file"><Publish /></label>
              <input
                type="file"
                id="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(event) => setFile(event.target.files[0])}
              />
            </div>
            {error && <div className="productError">{error}</div>}
            <button className="productButton" type="submit" disabled={saving}>
              {saving ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
