import "./newUser.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userRequest } from "../../requestMethods";

export default function NewUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    isAdmin: "false",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await userRequest.post("/users", {
        username: form.username,
        email: form.email,
        password: form.password,
        isAdmin: form.isAdmin === "true",
      });
      navigate("/users");
    } catch (requestError) {
      setError(
        requestError.response?.status === 409
          ? "Username or email already exists."
          : requestError.response?.data?.message || "The user could not be created."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="newUser">
      <h1 className="newUserTitle">New User</h1>
      <form className="newUserForm" onSubmit={handleSubmit}>
        <div className="newUserItem">
          <label>Username</label>
          <input name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div className="newUserItem">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="newUserItem">
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} />
        </div>
        <div className="newUserItem">
          <label>Role</label>
          <select className="newUserSelect" name="isAdmin" value={form.isAdmin} onChange={handleChange}>
            <option value="false">Customer</option>
            <option value="true">Administrator</option>
          </select>
        </div>
        {error && <div className="newUserError">{error}</div>}
        <button className="newUserButton" type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
