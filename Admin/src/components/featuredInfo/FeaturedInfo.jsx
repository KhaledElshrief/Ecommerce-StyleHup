import "./featuredInfo.css";
import { useEffect, useState } from "react";
import { userRequest } from "../../requestMethods";

export default function FeaturedInfo() {
  const [stats, setStats] = useState({ revenue: 0, sales: 0 });

  useEffect(() => {
    const getStats = async () => {
      try {
        const response = await userRequest.get("/orders");
        const orders = response.data;
        setStats({
          revenue: orders.reduce((total, order) => total + Number(order.amount || 0), 0),
          sales: orders.reduce(
            (total, order) =>
              total + (order.products || []).reduce(
                (items, product) => items + Number(product.quantity || 0),
                0
              ),
            0
          ),
        });
      } catch {}
    };
    getStats();
  }, []);

  return (
    <div className="featured">
      <div className="featuredItem">
        <span className="featuredTitle">Revenue</span>
        <div className="featuredMoneyContainer">
          <span className="featuredMoney">${stats.revenue.toFixed(2)}</span>
        </div>
        <span className="featuredSub">From real orders</span>
      </div>
      <div className="featuredItem">
        <span className="featuredTitle">Sales</span>
        <div className="featuredMoneyContainer">
          <span className="featuredMoney">{stats.sales}</span>
        </div>
        <span className="featuredSub">Items sold</span>
      </div>
      <div className="featuredItem">
        <span className="featuredTitle">Cost</span>
        <div className="featuredMoneyContainer">
          <span className="featuredMoney">N/A</span>
        </div>
        <span className="featuredSub">Not tracked</span>
      </div>
    </div>
  );
}
