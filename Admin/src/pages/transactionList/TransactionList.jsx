import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { userRequest } from "../../requestMethods";
import "./transactionList.css";

export default function TransactionList() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const [ordersResponse, usersResponse] = await Promise.all([
          userRequest.get("/orders"),
          userRequest.get("/users"),
        ]);
        const names = usersResponse.data.reduce((result, user) => {
          result[user._id] = user.username;
          return result;
        }, {});
        setOrders(
          ordersResponse.data.map((order) => ({
            ...order,
            customer: names[order.userId] || order.userId,
            total: `$${Number(order.amount || 0).toFixed(2)}`,
          }))
        );
      } catch (requestError) {
        console.error(requestError);
        setError("Could not load transactions.");
      }
    };
    loadOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await userRequest.put(`/orders/${id}`, { status });
      setOrders((current) =>
        current.map((order) => (order._id === id ? { ...order, status } : order))
      );
    } catch (requestError) {
      console.error(requestError);
      window.alert("The order status could not be updated.");
    }
  };

  const columns = [
    { field: "_id", headerName: "Order ID", width: 240 },
    { field: "customer", headerName: "Customer", width: 180 },
    { field: "total", headerName: "Amount", width: 130 },
    {
      field: "createdAt",
      headerName: "Date",
      width: 180,
      // MUI X Data Grid v7 passes the cell value and row separately.
      // The old `params.row` signature causes the page to crash.
      valueGetter: (_value, row) => {
        if (!row?.createdAt) return "—";

        const date = new Date(row.createdAt);
        return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: (params) => (
        <select
          value={params.row.status || "pending"}
          onChange={(event) => updateStatus(params.row._id, event.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      ),
    },
  ];

  return (
    <div className="transactionList">
      <h1>Transactions</h1>
      {error && <div className="transactionError">{error}</div>}
      <DataGrid
        rows={orders}
        columns={columns}
        getRowId={(row) => row._id}
        pageSize={8}
        disableSelectionOnClick
      />
    </div>
  );
}
