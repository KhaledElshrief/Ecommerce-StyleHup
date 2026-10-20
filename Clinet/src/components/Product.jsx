import {
    FavoriteBorderOutlined,
    SearchOutlined,
    ShoppingCartOutlined,
  } from "@material-ui/icons";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProduct } from "../redux/cartRedux";
import { toggleWishlist } from "../redux/wishlistRedux";
  
  const Info = styled.div`
    opacity: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.2);
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.5s ease;
    cursor: pointer;
  `;
  
  const Container = styled.div`
    flex: 1;
    margin: 5px;
    min-width: 280px;
    height: 350px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5fbfd;
    position: relative;
  
    &:hover ${Info}{
      opacity: 1;
    }
  `;
  
  const Circle = styled.div`
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background-color: white;
    position: absolute;
  `;
  
  const Image = styled.img`
    height: 75%;
    z-index: 2;
  `;
  
  const Icon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10px;
    transition: all 0.5s ease;
    &:hover {
      background-color: #e9f5f5;
      transform: scale(1.1);
    }
  `;
  
  const Product = ({ item }) => {
    const dispatch = useDispatch();
    const [added, setAdded] = useState(false);
    const isWishlisted = useSelector((state) =>
      state.wishlist.products.some((product) => product._id === item._id)
    );

    const handleAddToCart = () => {
      if (item.inStock === false) return;
      dispatch(
        addProduct({
          ...item,
          quantity: 1,
          color: item.color?.[0] || "",
          size: item.size?.[0] || "",
        })
      );
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1200);
    };

    const handleWishlist = () => {
      dispatch(toggleWishlist(item));
    };

    return (
      <Container>
        <Circle />
        <Image src={item.img} />
        <Info>
          <Icon
            onClick={handleAddToCart}
            title={item.inStock === false ? "Out of stock" : "Add to cart"}
            style={item.inStock === false ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
          >
            <ShoppingCartOutlined />
          </Icon>
          <Icon>
            <Link to ={`/product/${item._id}`}>
            <SearchOutlined />
            </Link>
          </Icon>
          <Icon
            onClick={handleWishlist}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FavoriteBorderOutlined color={isWishlisted ? "error" : undefined} />
          </Icon>
        </Info>
      </Container>
    );
  };
  
  export default Product;
