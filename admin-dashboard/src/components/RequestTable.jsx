import { useEffect, useState } from "react";
import { getRequests, updateRequestStatus } from "../api/api";

export default function RequestTable({ statusFilter }) {

  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");

  const loadRequests = async () => {
    const data = await getRequests();

    if (statusFilter === "all") {
      setRequests(data);
    } else {
      setRequests(data.filter((r) => r.status === statusFilter));
    }
  };

  const resolveRequest = async (id) => {
    await updateRequestStatus(id, "resolved");
    loadRequests();
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const filteredRequests = requests.filter((req) =>
    req.name?.toLowerCase().includes(search.toLowerCase()) ||
    req.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      padding: "3px 8px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: "500",
      display: "inline-block"
    };

    if (status === "pending") {
      return (
        <span style={{ ...styles, background: "#FEF3C7", color: "#92400E" }}>
          Pending
        </span>
      );
    }

    if (status === "open") {
      return (
        <span style={{ ...styles, background: "#DBEAFE", color: "#1E40AF" }}>
          Open
        </span>
      );
    }

    if (status === "resolved") {
      return (
        <span style={{ ...styles, background: "#DCFCE7", color: "#166534" }}>
          Resolved
        </span>
      );
    }

    return status;
  };

  return (
    <div style={{ padding: "1rem" }}>

      {/* Search */}
      <input
        type="text"
        placeholder="Search name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "12px",
          border: "1px solid #ddd",
          borderRadius: "6px",
          fontSize: "12px"
        }}
      />

      {/* Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "13px"
        }}
      >
        <thead>
          <tr style={{ background: "var(--color-background-secondary)" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>Name</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Email</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Date</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Action</th>
          </tr>
        </thead>

        <tbody>

          {filteredRequests.length === 0 && (
            <tr>
              <td colSpan="5" style={{ padding: "15px", textAlign: "center" }}>
                No requests found
              </td>
            </tr>
          )}

          {filteredRequests.map((req) => (
            <tr
              key={req._id}
              style={{
                borderTop: "0.5px solid var(--color-border-tertiary)"
              }}
            >
              <td style={{ padding: "10px" }}>{req.name}</td>

              <td style={{ padding: "10px" }}>{req.email}</td>

              <td style={{ padding: "10px" }}>
                {getStatusBadge(req.status)}
              </td>

              <td style={{ padding: "10px" }}>
                {new Date(req.createdAt).toLocaleDateString()}
              </td>

              <td style={{ padding: "10px" }}>
                {req.status !== "resolved" && (
                  <button
                    onClick={() => resolveRequest(req._id)}
                    style={{
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    Resolve
                  </button>
                )}
              </td>

            </tr>
          ))}

        </tbody>
      </table>

    </div>
  );
}