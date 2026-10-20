import "./sidebar.css";
import {
  LineStyle as LineStyleIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  PermIdentity as PermIdentityIcon,
  Storefront as StorefrontIcon,
  AttachMoney as AttachMoneyIcon,
  BarChart as BarChartIcon,
  MailOutline as MailOutlineIcon,
  DynamicFeed as DynamicFeedIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  WorkOutline as WorkOutlineIcon,
  Report as ReportIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebarWrapper">
        <div className="sidebarMenu">
          <h3 className="sidebarTitle">Dashboard</h3>
          <ul className="sidebarList">
            <Link to="/" className="link">
              <li className="sidebarListItem active">
                <LineStyleIcon className="sidebarIcon" />
                Home
              </li>
            </Link>
            <li className="sidebarListItem disabled" title="Analytics is not available yet">
              <TimelineIcon className="sidebarIcon" />
              Analytics
            </li>
            <Link to="/transactions" className="link">
            <li className="sidebarListItem">
              <TrendingUpIcon className="sidebarIcon" />
              Sales
            </li>
            </Link>
          </ul>
        </div>
        <div className="sidebarMenu">
          <h3 className="sidebarTitle">Quick Menu</h3>
          <ul className="sidebarList">
            <Link to="/users" className="link">
              <li className="sidebarListItem">
                <PermIdentityIcon className="sidebarIcon" />
                Users
              </li>
            </Link>
            <Link to="/products" className="link">
              <li className="sidebarListItem">
                <StorefrontIcon className="sidebarIcon" />
                Products
              </li>
            </Link>
            <Link to="/transactions" className="link">
            <li className="sidebarListItem">
              <AttachMoneyIcon className="sidebarIcon" />
              Transactions
            </li>
            </Link>
            <li className="sidebarListItem disabled" title="Reports are not available yet">
              <BarChartIcon className="sidebarIcon" />
              Reports
            </li>
          </ul>
        </div>
        <div className="sidebarMenu">
          <h3 className="sidebarTitle">Notifications</h3>
          <ul className="sidebarList">
            <li className="sidebarListItem disabled" title="Mail is not available yet">
              <MailOutlineIcon className="sidebarIcon" />
              Mail
            </li>
            <li className="sidebarListItem disabled" title="Feedback is not available yet">
              <DynamicFeedIcon className="sidebarIcon" />
              Feedback
            </li>
            <li className="sidebarListItem disabled" title="Messages are not available yet">
              <ChatBubbleOutlineIcon className="sidebarIcon" />
              Messages
            </li>
          </ul>
        </div>
        <div className="sidebarMenu">
          <h3 className="sidebarTitle">Staff</h3>
          <ul className="sidebarList">
            <li className="sidebarListItem disabled" title="Staff management is not available yet">
              <WorkOutlineIcon className="sidebarIcon" />
              Manage
            </li>
            <li className="sidebarListItem disabled" title="Staff analytics is not available yet">
              <TimelineIcon className="sidebarIcon" />
              Analytics
            </li>
            <li className="sidebarListItem disabled" title="Staff reports are not available yet">
              <ReportIcon className="sidebarIcon" />
              Reports
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
