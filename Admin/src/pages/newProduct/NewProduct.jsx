import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./newProduct.css";
import { addProduct } from "../../redux/apiCalls";
import { useDispatch } from "react-redux";

export default function NewProduct() {
  const [inputs, setInputs] = useState({});
  const [file, setFile] = useState(null);
  const [cat, setCat] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => { 
    setInputs((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };
  const handleCat = (e) => {
    setCat(e.target.value.split(","));
  };

  const handleClick = (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please choose a product image first.");
      return;
    }

    if (!inputs.title || !inputs.desc || !inputs.price) {
      setError("Please fill in title, description, and price.");
      return;
    }

    setError("");
    setSaving(true);
    const product = new FormData();
    product.append("image", file);
    product.append("title", inputs.title);
    product.append("desc", inputs.desc);
    product.append("price", inputs.price);
    product.append("inStock", inputs.inStock ?? "true");
    product.append("categories", JSON.stringify(cat));

    addProduct(product, dispatch)
      .then(() => {
        setSaving(false);
        navigate("/products");
      })
      .catch((requestError) => {
        setSaving(false);
        const status = requestError.response?.status;
        setError(
          status === 409
            ? "A product with this title already exists."
            : "Product could not be saved. Check the backend response."
        );
      });
  };

  return (
    <div className="newProduct">
      <h1 className="addProductTitle">New Product</h1>
      <form className="addProductForm">
        <div className="addProductItem">
          <label>Image</label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <div className="addProductItem">
          <label>Title</label>
          <input
            name="title"
            type="text"
            placeholder="Apple Airpods"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Description</label>
          <input
            name="desc"
            type="text"
            placeholder="description..."
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Price</label>
          <input
            name="price"
            type="number"
            placeholder="100"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Categories</label>
          <input type="text" placeholder="jeans,skirts" onChange={handleCat} />
        </div>
        <div className="addProductItem">
          <label>Stock</label>
          <select name="inStock" onChange={handleChange}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        {error && <div className="addProductError">{error}</div>}
        <button onClick={handleClick} className="addProductButton" disabled={saving}>
          {saving ? "Uploading..." : "Create"}
        </button>
      </form>
    </div>
  );
}
