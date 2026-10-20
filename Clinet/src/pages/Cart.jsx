import { Add, DeleteOutline, Remove } from "@material-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import Announcement from "../components/Announcement";
import Footer from "../components/Footer";
import { mobile } from "../responsive";
import StripeCheckout from "react-stripe-checkout";
import { useEffect, useRef, useState } from "react";
import { publicRequest, userRequest } from "../requestMethods";
import { changeQuantity, removeProduct, reset, syncProducts } from "../redux/cartRedux";
import { useNavigate } from "react-router";
import Navbar from "../components/NavBar";

const KEY = "pk_test_51QHwLgFarJfQzCh4JR18v0ASofJvysFLmxbooiEGKggo3gJPcF7mSdNDC76Tcu01wh3DM3QYkGXipTgEDWRUqRD5008vAVQkGE";

const Container = styled.div``;

const Wrapper = styled.div`
  padding: 20px;
  ${mobile({ padding: "10px" })}
`;

const Title = styled.h1`
  font-weight: 300;
  text-align: center;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
`;

const TopButton = styled.button`
  padding: 10px;
  font-weight: 600;
  cursor: pointer;
  border: ${(props) => props.type === "filled" && "none"};
  background-color: ${(props) =>
    props.type === "filled" ? "black" : "transparent"};
  color: ${(props) => props.type === "filled" && "white"};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

const TopTexts = styled.div`
  ${mobile({ display: "none" })}
`;
const TopText = styled.span`
  text-decoration: underline;
  cursor: pointer;
  margin: 0px 10px;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  ${mobile({ flexDirection: "column" })}
`;

const Info = styled.div`
  flex: 3;
`;

const Product = styled.div`
  display: flex;
  justify-content: space-between;
  ${mobile({ flexDirection: "column" })}
`;

const ProductDetail = styled.div`
  flex: 2;
  display: flex;
`;

const Image = styled.img`
  width: 200px;
`;

const Details = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const ProductName = styled.span``;

const ProductId = styled.span``;

const ProductColor = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${(props) => props.color};
`;

const ProductSize = styled.span``;

const PriceDetail = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ProductAmountContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const ProductAmount = styled.div`
  font-size: 24px;
  margin: 5px;
  ${mobile({ margin: "5px 15px" })}
`;

const ProductPrice = styled.div`
  font-size: 30px;
  font-weight: 200;
  ${mobile({ marginBottom: "20px" })}
`;

const RemoveButton = styled.button`
  margin-top: 14px;
  border: 0;
  background: transparent;
  color: #d33;
  cursor: pointer;
  font-size: 13px;
`;

const Hr = styled.hr`
  background-color: #eee;
  border: none;
  height: 1px;
`;

const Summary = styled.div`
  flex: 1;
  border: 0.5px solid lightgray;
  border-radius: 10px;
  padding: 20px;
  height: 50vh;
`;

const SummaryTitle = styled.h1`
  font-weight: 200;
`;

const SummaryItem = styled.div`
  margin: 30px 0px;
  display: flex;
  justify-content: space-between;
  font-weight: ${(props) => props.type === "total" && "500"};
  font-size: ${(props) => props.type === "total" && "24px"};
`;

const SummaryItemText = styled.span``;

const SummaryItemPrice = styled.span``;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: black;
  color: white;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

const PaymentError = styled.p`
  color: #c62828;
  font-size: 13px;
  line-height: 1.4;
`;

const Cart = () => {
  const cart = useSelector((state) => state.cart);
  const user = useSelector((state) => state.user.currentUser);
  const wishlistQuantity = useSelector(
    (state) => state.wishlist?.products?.length || 0
  );
  const dispatch = useDispatch();
  const [stripeToken, setStripeToken] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const paymentStarted = useRef(false);
  const checkoutButtonRef = useRef(null);
  const navigate = useNavigate();

  const onToken = (token) => {
    setPaymentError("");
    setStripeToken(token);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    checkoutButtonRef.current?.click();
  };

  // A persisted cart can contain an old product price. Always refresh prices
  // before opening Stripe so the customer is charged the current price.
  useEffect(() => {
    const syncCartPrices = async () => {
      if (!cart.products.length) return;
      try {
        const res = await publicRequest.get("/products");
        dispatch(syncProducts(res.data));
      } catch (error) {
        console.error("Unable to refresh cart prices", error);
      }
    };
    syncCartPrices();
  }, [dispatch, cart.products.length]);

  useEffect(() => {
    const makeRequest = async () => {
      if (paymentStarted.current) return;
      paymentStarted.current = true;
      try {
        const res = await userRequest.post("/checkout/payment", {
          tokenId: stripeToken.id,
          amount: Math.round(Number(cart.total) * 100),
          products: cart.products.map((product) => ({
            productId: product._id,
            quantity: product.quantity || 1,
          })),
        });

        const orderRes = await userRequest.post("/orders", {
          userId: user._id,
          products: cart.products.map((product) => ({
            productId: product._id,
            quantity: product.quantity || 1,
          })),
            amount: Number(cart.total),
          address: {},
          status: "paid",
        });

        dispatch(reset());
        setStripeToken(null);

        navigate("/success", {
          state: {
            stripeData: res.data,
            orderData: orderRes.data,
            products: cart,
          },
        });
        
      } catch (error) {
        paymentStarted.current = false;
        setStripeToken(null);
        setPaymentError(
          error.response?.data?.message ||
            "Payment could not be completed. Please try again."
        );
        console.error("Payment failed", error);
      }
    };
    stripeToken && makeRequest();
  }, [stripeToken, cart, user, navigate, dispatch]);
  return (
    <Container>
      <Navbar />
      <Announcement />
      <Wrapper>
        <Title>YOUR BAG</Title>
        <Top>
          <TopButton onClick={() => navigate("/")}>CONTINUE SHOPPING</TopButton>
          <TopTexts>
            <TopText>Shopping Bag({cart.quantity})</TopText>
            <TopText onClick={() => navigate("/wishlist")}>
              Your Wishlist ({wishlistQuantity})
            </TopText>
          </TopTexts>
          <TopButton
            type="filled"
            onClick={handleCheckout}
            disabled={!cart.products.length}
          >
            {user ? "CHECKOUT NOW" : "SIGN IN TO CHECKOUT"}
          </TopButton>
        </Top>
        <Bottom>
          <Info>
            {cart.products.map((product, index) => (
              <Product key={`${product._id}-${index}`}>
                <ProductDetail>
                  <Image src={product.img} />
                  <Details>
                    <ProductName>
                      <b>Product:</b> {product.title}
                    </ProductName>
                    <ProductId>
                      <b>ID:</b> {product._id}
                    </ProductId>
                    <ProductColor color={product.color} />
                    <ProductSize>
                      <b>Size:</b> {product.size}
                    </ProductSize>
                  </Details>
                </ProductDetail>
                <PriceDetail>
                  <ProductAmountContainer>
                    <Add
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        dispatch(changeQuantity({ index, delta: 1 }))
                      }
                    />
                    <ProductAmount>{product.quantity}</ProductAmount>
                    <Remove
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        dispatch(changeQuantity({ index, delta: -1 }))
                      }
                    />
                  </ProductAmountContainer>
                  <ProductPrice>
                    $ {product.price * product.quantity}
                  </ProductPrice>
                  <RemoveButton
                    onClick={() => dispatch(removeProduct(index))}
                    type="button"
                  >
                    <DeleteOutline fontSize="small" /> Remove
                  </RemoveButton>
                </PriceDetail>
              </Product>
            ))}
            <Hr />
          </Info>
          <Summary>
            <SummaryTitle>ORDER SUMMARY</SummaryTitle>
            <SummaryItem>
              <SummaryItemText>Subtotal</SummaryItemText>
              <SummaryItemPrice>$ {cart.total}</SummaryItemPrice>
            </SummaryItem>
            <SummaryItem>
              <SummaryItemText>Estimated Shipping</SummaryItemText>
              <SummaryItemPrice>$ 5.90</SummaryItemPrice>
            </SummaryItem>
            <SummaryItem>
              <SummaryItemText>Shipping Discount</SummaryItemText>
              <SummaryItemPrice>$ -5.90</SummaryItemPrice>
            </SummaryItem>
            <SummaryItem type="total">
              <SummaryItemText>Total</SummaryItemText>
              <SummaryItemPrice>$ {cart.total}</SummaryItemPrice>
            </SummaryItem>
            {paymentError && <PaymentError role="alert">{paymentError}</PaymentError>}
            <StripeCheckout
              name="StyleHub"
              image=""
              billingAddress
              shippingAddress
              description={`Your total is $${cart.total}`}
              amount={Math.round(Number(cart.total) * 100)}
              token={onToken}
              stripeKey={KEY}
            >
              <Button
                ref={checkoutButtonRef}
                disabled={!cart.products.length || !user}
              >
                CHECKOUT NOW
              </Button>
            </StripeCheckout>
          </Summary>
        </Bottom>
      </Wrapper>
      <Footer />
    </Container>
  );
};

export default Cart;
