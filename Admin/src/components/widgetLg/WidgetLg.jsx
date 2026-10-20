import { useEffect, useState } from "react";
import { userRequest } from "../../requestMethods";
import "./widgetLg.css";
import { Link } from "react-router-dom";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

export default function WidgetLg() {
  const [orders, setOrders] = useState([]);

  useEffect(() => { 
    const getOrders = async () => {
      try {
        const [ordersResponse, usersResponse] = await Promise.all([
          userRequest.get("orders"),
          userRequest.get("users"),
        ]);
        const usersById = usersResponse.data.reduce((users, user) => {
          users[user._id] = user.username;
          return users;
        }, {});
        setOrders(
          ordersResponse.data.map((order) => ({
            ...order,
            customerName: usersById[order.userId] || order.userId,
          }))
        );
      } catch {}
    };
    getOrders();
  }, []);
  const Button = ({ type }) => {
    return <Link to="/transactions" className="link">
      <button className={"widgetLgButton " + type}>{type || "pending"}</button>
    </Link>;
  };
  return (
    <div className="widgetLg">
      <h3 className="widgetLgTitle">Latest transactions</h3>
      <table className="widgetLgTable">
        <tr className="widgetLgTr">
          <th className="widgetLgTh">Customer</th>
          <th className="widgetLgTh">Date</th>
          <th className="widgetLgTh">Amount</th>
          <th className="widgetLgTh">Status</th>
        </tr>
        <tbody>
        {orders.slice(0, 5).map((order) => (
          <tr className="widgetLgTr" key={order._id}>
            <td className="widgetLgUser">
              <span className="widgetLgName">{order.customerName}</span>
            </td>
            <td className="widgetLgDate">{formatDate(order.createdAt)}</td>
            <td className="widgetLgAmount">${order.amount}</td>
            <td className="widgetLgStatus">
              <Button type={order.status} />
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}
