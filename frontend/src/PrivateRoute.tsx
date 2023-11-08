import axios from "./axios";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const [auth, setAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .post("/api/check_login")
      .then(() => setAuth(true))
      .catch(() => setAuth(false))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }
  return auth ? <Outlet /> : <></>;
}
