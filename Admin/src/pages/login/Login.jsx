import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/apiCalls";
import "./login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const { isFetching, error } = useSelector((state) => state.user);

  const handleClick = (e) => {
    e.preventDefault();
    login(dispatch, { username, password });
  };

  return (
    <main className="loginPage">
      <section className="loginCard">
        <div className="loginBrand">
          <div className="loginBrandMark">S</div>
          <div>
            <h1>StyleHub</h1>
            <span>Admin dashboard</span>
          </div>
        </div>

        <div className="loginHeading">
          <h2>Welcome back</h2>
          <p>Sign in to manage your store.</p>
        </div>

        <form className="loginForm" onSubmit={handleClick}>
          <label htmlFor="admin-username">Username</label>
          <input
            id="admin-username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="loginError">Invalid username or password.</p>}

          <button type="submit" disabled={isFetching}>
            {isFetching ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="loginFooter">Secure access for store administrators</p>
      </section>
    </main>
  );
};

export default Login;
