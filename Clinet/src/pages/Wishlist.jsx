import { DeleteOutline, ShoppingCartOutlined } from "@material-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Announcement from "../components/Announcement";
import Footer from "../components/Footer";
import Navbar from "../components/NavBar";
import { addProduct } from "../redux/cartRedux";
import { removeWishlist } from "../redux/wishlistRedux";

const Page = styled.div`
  min-height: 100vh;
`;

const Wrapper = styled.main`
  min-height: 55vh;
  padding: 35px 20px;
`;

const Title = styled.h1`
  text-align: center;
  font-weight: 300;
`;

const Empty = styled.p`
  margin: 70px auto;
  text-align: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  max-width: 1100px;
  margin: 35px auto;
`;

const Card = styled.article`
  position: relative;
  padding: 15px;
  border: 1px solid #eee;
  background: #f5fbfd;
`;

const Image = styled.img`
  width: 100%;
  height: 230px;
  object-fit: contain;
`;

const Name = styled.h3`
  margin: 10px 0 6px;
  font-weight: 400;
`;

const Price = styled.p`
  margin: 0 0 12px;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const Action = styled.button`
  flex: 1;
  padding: 9px;
  border: 1px solid #111;
  background: ${(props) => (props.danger ? "white" : "#111")};
  color: ${(props) => (props.danger ? "#d33" : "white")};
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

export default function Wishlist() {
  const products = useSelector((state) => state.wishlist.products);
  const dispatch = useDispatch();

  return (
    <Page>
      <Navbar />
      <Announcement />
      <Wrapper>
        <Title>YOUR WISHLIST</Title>
        {!products.length ? (
          <Empty>
            Your wishlist is empty. <Link to="/products/all">Browse products</Link>
          </Empty>
        ) : (
          <Grid>
            {products.map((product) => (
              <Card key={product._id}>
                <Link to={`/product/${product._id}`}>
                  <Image src={product.img} alt={product.title} />
                </Link>
                <Name>{product.title}</Name>
                <Price>$ {Number(product.price || 0).toFixed(2)}</Price>
                <Actions>
                  <Action
                    disabled={product.inStock === false}
                    onClick={() =>
                      dispatch(
                        addProduct({
                          ...product,
                          quantity: 1,
                          color: product.color?.[0] || "",
                          size: product.size?.[0] || "",
                        })
                      )
                    }
                    title={product.inStock === false ? "Out of stock" : "Add to cart"}
                  >
                    <ShoppingCartOutlined fontSize="small" />
                  </Action>
                  <Action
                    danger
                    onClick={() => dispatch(removeWishlist(product._id))}
                    title="Remove from wishlist"
                  >
                    <DeleteOutline fontSize="small" />
                  </Action>
                </Actions>
              </Card>
            ))}
          </Grid>
        )}
      </Wrapper>
      <Footer />
    </Page>
  );
}
