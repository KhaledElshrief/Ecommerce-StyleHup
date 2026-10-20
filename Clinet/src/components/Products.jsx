import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Product from "./Product";
import { publicRequest } from "../requestMethods";

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const Products = ({ cat, filters = {}, sort = "newest", search = "" }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProducts = async () => {
      setError("");
      try {
        const response = await publicRequest.get(
          cat && cat !== "all"
            ? `/products?category=${encodeURIComponent(cat)}`
            : "/products"
        );
        setProducts(response.data);
      } catch (requestError) {
        console.error(requestError);
        setError("Products could not be loaded.");
      }
    };
    getProducts();
  }, [cat]);

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const values = Array.isArray(product[key]) ? product[key] : [];
        return values.includes(value);
      }) &&
      (!search ||
        `${product.title} ${product.desc}`.toLowerCase().includes(search.toLowerCase()))
    );

    return filtered.sort((first, second) => {
      if (sort === "asc") return Number(first.price) - Number(second.price);
      if (sort === "desc") return Number(second.price) - Number(first.price);
      return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
    });
  }, [products, filters, sort, search]);

  if (error) return <div>{error}</div>;

  return (
    <Container>
      {(cat ? visibleProducts : visibleProducts.slice(0, 8)).map((item) => (
        <Product item={item} key={item._id} />
      ))}
    </Container>
  );
};

export default Products;
