import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import axios from "./axios";
import MessageList from "./components/MessageList";
import { api } from "../convex/_generated/api";
import UserList from "./components/UserList";

import { IUser } from "./types";

export default function Home() {
  const [user, setUser] = useState<IUser>();
  const [error, setError] = useState("");
  const updateUser = useMutation(api.users.update);
  const updateGroup = useMutation(api.groups.update);

  const [newMessageText, setNewMessageText] = useState("");

  const handleSendMessage = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!user?.employee_code) {
        return;
      }

      setNewMessageText("");
      setError("");

      const content = newMessageText.trim();
      if (!content) {
        return;
      }

      try {
        if (user.is_group) {
          await axios.post("/api/send-to-group", {
            group_id: user.employee_code,
            text_content: content,
          });
        } else {
          await axios.post("/api/manual-reply", {
            employee_code: user.employee_code,
            text_content: content,
          });
        }
      } catch (error) {
        setError("Error sending message");
      }
    },
    [user, newMessageText]
  );

  const scrollToBottom = useCallback(() => {
    const messagesElm = document.getElementById("messages");
    if (messagesElm) {
      messagesElm.scrollTop = messagesElm.scrollHeight;
    }
  }, []);

  const onSelectUser = useCallback((user: IUser) => {
    setUser(user);
    window.setTimeout(() => {
      // reset the unread count
      if (user.is_group) {
        updateGroup({
          group_id: user.employee_code,
          payload: {
            unread_count: 0,
          },
        });
      } else {
        updateUser({
          employee_code: user.employee_code,
          payload: {
            unread_count: 0,
          },
        });
      }
    }, 2000);
  }, []);

  return (
    <main style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <div
        style={{
          width: "300px",
          borderRight: "1px solid #ccc",
          overflow: "auto",
        }}
      >
        <UserList selectedUser={user} onSelect={onSelectUser} />
      </div>
      <div style={{ height: "100%", flex: 1 }}>
        {user && (
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <div
              style={{
                padding: "15px 20px",
                borderBottom: "1px solid #ccc",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={user.avatar}
                alt=""
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  marginRight: "10px",
                  border: "1px solid #ccc",
                }}
              />
              <div>
                <div>
                  {user.name} ({user.seatalk_id})
                </div>
                <div>{user.email}</div>
              </div>
            </div>
            <div
              id="messages"
              style={{ flex: 1, overflow: "auto", padding: "20px" }}
            >
              <MessageList
                employeeCode={user.employee_code}
                scrollToBottom={scrollToBottom}
                isGroup={user.is_group}
              />
            </div>
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: "20px",
                borderTop: "1px solid #ccc",
                display: "flex",
                position: "relative",
              }}
            >
              <input
                value={newMessageText}
                onChange={(event) => setNewMessageText(event.target.value)}
                placeholder="Write a message…"
                style={{
                  flex: 1,
                  padding: "15px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  marginRight: "10px",
                }}
                onFocus={() => scrollToBottom()}
              />
              <input
                type="submit"
                value="Send"
                disabled={!newMessageText}
                style={{
                  width: "100px",
                  borderRadius: "20px",
                  border: "none",
                  cursor: !newMessageText ? "not-allowed" : "pointer",
                }}
              />
              {false && (
                <button
                  onClick={scrollToBottom}
                  style={{
                    borderRadius: "10px",
                    border: "none",
                    position: "absolute",
                    top: "-50px",
                    right: "-10px",
                    padding: "15px",
                    cursor: "pointer",
                    color: "#555",
                  }}
                >
                  Scroll to Bottom
                </button>
              )}
            </form>
            <div
              style={{
                color: "red",
                margin: "-15px 20px 10px 20px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
