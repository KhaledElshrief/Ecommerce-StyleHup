import { Badge } from "@material-ui/core";
import { Search, ShoppingCartOutlined, ExitToApp } from "@material-ui/icons";
import React, { useState } from "react";
import styled from "styled-components";
import { mobile } from "../responsive";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../redux/userRedux";

const Container = styled.div`
  height: 60px;
  ${mobile({ height: "50px" })}
`;

const Wrapper = styled.div`
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${mobile({ padding: "10px 0px" })}
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const Language = styled.span`
  font-size: 14px;
  cursor: pointer;
  ${mobile({ display: "none" })}
`;

const SearchContainer = styled.div`
  border: 0.5px solid lightgray;
  display: flex;
  align-items: center;
  margin-left: 25px;
  padding: 5px;
`;

const Input = styled.input`
  border: none;
  ${mobile({ width: "50px" })}
`;

const Center = styled.div`
  flex: 1;
  text-align: center;
`;

const Logo = styled.h1`
  font-weight: bold;
  ${mobile({ fontSize: "24px" })}
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  ${mobile({ flex: 2, justifyContent: "center" })}
`;

const MenuItem = styled.div`
  font-size: 14px;
  cursor: pointer;
  margin-left: 25px;
  display: flex;
  align-items: center;
  ${mobile({ fontSize: "12px", marginLeft: "10px" })}
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-left: 25px;
  font-size: 14px;
  ${mobile({ fontSize: "12px", marginLeft: "10px" })}
`;

const UserName = styled.span`
  margin-right: 10px;
  font-weight: 500;
`;

const Navbar = () => {
  const quantity = useSelector(state => state.cart.quantity);
  const user = useSelector(state => state.user.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("persist:root");
    navigate("/");
  };

  return (
    <Container>
      <Wrapper>
        <Left>
          <Language>EN</Language>
          <SearchContainer as="form" onSubmit={(event) => {
            event.preventDefault();
            const value = search.trim();
            if (value) navigate(`/products/all?search=${encodeURIComponent(value)}`);
          }}>
            <Input
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Search style={{ color: "gray", fontSize: 16 }} />
          </SearchContainer>
        </Left>
        
        <Center>
          <StyledLink to="/">
            <Logo>StyleHub</Logo>
          </StyledLink>
        </Center>
        
        <Right>
          {user ? (
            <>
              <UserInfo>
                <UserName>Welcome, {user.username}</UserName>
              </UserInfo>
              <MenuItem onClick={handleLogout}>
                <ExitToApp style={{ marginRight: "5px" }} />
                LOGOUT
              </MenuItem>
            </>
          ) : (
            <>
              <Link to="/register" style={{ textDecoration: "none", color: "inherit" }}>
                <MenuItem>REGISTER</MenuItem>
              </Link>
              <Link to="/login" style={{ textDecoration: "none", color: "inherit" }}>
                <MenuItem>SIGN IN</MenuItem>
              </Link>
            </>
          )}
          <Link to="/cart" style={{ textDecoration: "none", color: "inherit" }}>
            <MenuItem>
              <Badge badgeContent={quantity} color="primary">
                <ShoppingCartOutlined />
              </Badge>
            </MenuItem>
          </Link>
        </Right>
      </Wrapper>
    </Container>
  );
};

export default Navbar;
