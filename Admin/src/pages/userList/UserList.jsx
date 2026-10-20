import "./userList.css";
import { DataGrid } from "@mui/x-data-grid"; // Updated import for DataGrid
import { DeleteOutline } from "@mui/icons-material"; // Updated import for icons
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { userRequest } from "../../requestMethods";

export default function UserList() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const [usersResponse, ordersResponse] = await Promise.all([
          userRequest.get("/users"),
          userRequest.get("/orders"),
        ]);

        const volumeByUser = ordersResponse.data.reduce((totals, order) => {
          totals[order.userId] = (totals[order.userId] || 0) + Number(order.amount || 0);
          return totals;
        }, {});

        setData(
          usersResponse.data.map((user) => ({
            ...user,
            avatar:
              user.img ||
              "https://crowd-literature.eu/wp-content/uploads/2015/01/no-avatar.gif",
            status: user.isAdmin ? "admin" : "active",
            transaction: `$${(volumeByUser[user._id] || 0).toFixed(2)}`,
          }))
        );
      } catch (requestError) {
        console.error(requestError);
        setError("Could not load users from the backend.");
      }
    };

    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await userRequest.delete(`/users/${id}`);
      setData((current) => current.filter((item) => item._id !== id));
    } catch (requestError) {
      console.error(requestError);
      window.alert("The user could not be deleted.");
    }
  };

  const columns = [
    { field: "_id", headerName: "ID", width: 220 },
    {
      field: "user",
      headerName: "User",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="userListUser">
            <img className="userListImg" src={params.row.avatar} alt="" />
            {params.row.username}
          </div>
        );
      },
    },
    { field: "email", headerName: "Email", width: 200 },
    {
      field: "status",
      headerName: "Status",
      width: 120,
    },
    {
      field: "transaction",
      headerName: "Transaction Volume",
      width: 160,
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => {
        return (
          <>
            <Link to={"/user/" + params.row._id}>
              <button className="userListEdit">Edit</button>
            </Link>
            <DeleteOutline
              className="userListDelete"
              onClick={() => handleDelete(params.row._id)}
            />
          </>
        );
      },
    },
  ];

  return (
    <div className="userList">
      <div className="userListHeader">
        <h1 className="userListTitle">Users</h1>
        <Link to="/newUser">
          <button className="userListCreate">Create User</button>
        </Link>
      </div>
      {error && <div className="userListError">{error}</div>}
      <DataGrid
        rows={data}
        columns={columns}
        getRowId={(row) => row._id}
        pageSize={8}
        checkboxSelection
        disableSelectionOnClick
      />
    </div>
  );
}
