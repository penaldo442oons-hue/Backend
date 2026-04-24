import { Link } from "react-router-dom";

export default function Success() {
  return (
    <div style={{ textAlign: "center", marginTop: "120px", fontFamily: "sans-serif" }}>

      <h1>✅ Request Submitted</h1>

      <p>Your request has been received.</p>

      <Link to="/">
        Back to Home
      </Link>

    </div>
  );
}