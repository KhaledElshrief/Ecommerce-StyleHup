import { MailOutline, PermIdentity } from "@mui/icons-material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { userRequest } from "../../requestMethods";
import "./user.css";

const fallbackAvatar =
  "https://crowd-literature.eu/wp-content/uploads/2015/01/no-avatar.gif";

export default function User() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await userRequest.get(`/users/find/${userId}`);
        setUser(response.data);
        setForm({
          username: response.data.username || "",
          email: response.data.email || "",
          password: "",
          isAdmin: String(Boolean(response.data.isAdmin)),
        });
      } catch (requestError) {
        console.error(requestError);
        setError("Could not load this user.");
      }
    };

    loadUser();
  }, [userId]);

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

    const update = {
      username: form.username,
      email: form.email,
      isAdmin: form.isAdmin === "true",
    };
    if (form.password) update.password = form.password;

    try {
      await userRequest.put(`/users/${userId}`, update);
      navigate("/users");
    } catch (requestError) {
      setError(
        requestError.response?.status === 409
          ? "Username or email already exists."
          : "The user could not be updated."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!user || !form) {
    return <div className="user">{error || "Loading user..."}</div>;
  }

  return (
    <div className="user">
      <div className="userTitleContainer">
        <h1 className="userTitle">Edit User</h1>
        <Link to="/users">
          <button className="userAddButton">Back</button>
        </Link>
      </div>
      <div className="userContainer">
        <div className="userShow">
          <div className="userShowTop">
            <img
              src={user.img || fallbackAvatar}
              alt=""
              className="userShowImg"
            />
            <div className="userShowTopTitle">
              <span className="userShowUsername">{user.username}</span>
              <span className="userShowUserTitle">
                {user.isAdmin ? "Administrator" : "Customer"}
              </span>
            </div>
          </div>
          <div className="userShowBottom">
            <span className="userShowTitle">Account Details</span>
            <div className="userShowInfo">
              <PermIdentity className="userShowIcon" />
              <span className="userShowInfoTitle">{user.username}</span>
            </div>
            <span className="userShowTitle">Contact Details</span>
            <div className="userShowInfo">
              <MailOutline className="userShowIcon" />
              <span className="userShowInfoTitle">{user.email}</span>
            </div>
          </div>
        </div>
        <div className="userUpdate">
          <span className="userUpdateTitle">Edit</span>
          <form className="userUpdateForm" onSubmit={handleUpdate}>
            <div className="userUpdateLeft">
              <div className="userUpdateItem">
                <label>Username</label>
                <input name="username" value={form.username} onChange={handleChange} className="userUpdateInput" />
              </div>
              <div className="userUpdateItem">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="userUpdateInput" />
              </div>
              <div className="userUpdateItem">
                <label>New Password (optional)</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className="userUpdateInput" />
              </div>
              <div className="userUpdateItem">
                <label>Role</label>
                <select name="isAdmin" value={form.isAdmin} onChange={handleChange} className="userUpdateInput">
                  <option value="false">Customer</option>
                  <option value="true">Administrator</option>
                </select>
              </div>
            </div>
            <div className="userUpdateRight">
              <span>{error}</span>
              <button className="userUpdateButton" type="submit" disabled={saving}>
                {saving ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
