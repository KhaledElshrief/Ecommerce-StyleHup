import React from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";

const Page = styled.div`
  min-height: 100vh;
  background: #f7fbfc;
`;

const Wrapper = styled.main`
  min-height: 62vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
`;

const Card = styled.section`
  width: min(520px, 100%);
  padding: 42px 34px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);
`;

const Check = styled.div`
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #168f87;
  color: white;
  font-size: 42px;
`;

const Title = styled.h1`
  margin: 0 0 12px;
  font-weight: 400;
`;

const Message = styled.p`
  margin: 0 auto 25px;
  color: #555;
  line-height: 1.6;
`;

const Details = styled.div`
  margin: 0 auto 28px;
  padding: 14px 18px;
  text-align: left;
  border: 1px solid #e4eeee;
  border-radius: 8px;
  color: #444;
  line-height: 1.9;
`;

const Button = styled(Link)`
  display: inline-block;
  padding: 13px 28px;
  background: #111;
  color: white;
  text-decoration: none;
  font-weight: 600;
`;

const Success = () => {
  const { state } = useLocation();
  const stripeData = state?.stripeData;
  const orderData = state?.orderData;
  const total = Number(stripeData?.amount || state?.products?.total || 0) / 100;
  const reference = orderData?._id || stripeData?.id || "Completed";

  return (
    <Page>
      <Navbar />
      <Wrapper>
        <Card role="status" aria-live="polite">
          <Check>&#10003;</Check>
          <Title>Payment successful!</Title>
          <Message>
            Thank you for your order. Your payment was completed successfully
            and your order has been saved.
          </Message>
          <Details>
            <div><strong>Amount:</strong> ${total.toFixed(2)}</div>
            <div><strong>Reference:</strong> {reference}</div>
            <div><strong>Status:</strong> Paid</div>
          </Details>
          <Button to="/">Continue shopping</Button>
        </Card>
      </Wrapper>
      <Footer />
    </Page>
  );
};

export default Success;
