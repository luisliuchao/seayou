import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSecretChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSecret(event.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      try {
        await axios.post("/api/login", {
          secret,
        });
        navigate("/");
      } catch (error: any) {
        setError("Invalid secret");
      }
    },
    [secret]
  );

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <label>
        Secret:{" "}
        <input
          type="text"
          value={secret}
          onChange={handleSecretChange}
          style={{
            padding: "10px",
            borderRadius: "5px",
          }}
        />
      </label>
      <br />
      <button
        type="submit"
        style={{
          padding: "10px 20px",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#ccc",
          cursor: "pointer",
        }}
      >
        Login
      </button>
      <span
        style={{
          color: "red",
          marginTop: "10px",
          fontSize: "12px",
        }}
      >
        {error}
      </span>
    </form>
  );
}
