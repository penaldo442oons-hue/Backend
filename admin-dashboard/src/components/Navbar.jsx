import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      style={{
        backgroundColor: "#1e293b",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white"
      }}
    >
      <h2 style={{ margin: 0 }}>Support Portal</h2>

      <div>
        <Link
          to="/"
          style={{
            color: "white",
            marginRight: "20px",
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Submit Request
        </Link>

        <Link
          to="/track"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Track Request
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;