import { useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import axios from "../axios";

import { IUser } from "../types";

interface Props {
  onSelect: (item: IUser) => void;
  selectedUser: IUser | undefined;
}

const UserList = ({ onSelect, selectedUser }: Props) => {
  const all_groups = useQuery(api.groups.list) || [];
  const all_users = useQuery(api.users.list) || [];

  const groups = useMemo(
    () =>
      all_groups.sort((a, b) => {
        return a.group_name.localeCompare(b.group_name);
      }).map(group => {
        return {
          ...group,
          name: group.group_name,
          employee_code: group.group_id,
          avatar: "https://i.pravatar.cc/300",
          is_group: true,
          seatalk_id: group.group_id,
          email: "",
        }
      }),
    [all_groups]
  );

  const users = useMemo(
    () =>
      all_users.sort((a, b) => {
        return a.name.localeCompare(b.name);
      }),
    [all_users]
  );

  const list = [...groups, ...users];

  const showSendToAllDialog = useCallback(async () => {
    const message = prompt("Message to send to all users");
    if (!message) {
      return;
    }

    try {
      await axios.post("/api/send-to-all", {
        text_content: message,
      });
      // show success message
      alert("Message sent to all users");
    } catch (error) {
      alert("Error sending message");
    }
  }, []);

  return (
    <div>
      <div
        key="group"
        style={{
          padding: "20px",
          borderBottom: "1px solid #ccc",
          display: "flex",
          alignItems: "center",
        }}
        onClick={() => {
          showSendToAllDialog();
        }}
      >
        <button
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "20px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#329",
            color: "#eee",
            fontSize: "16px",
          }}
        >
          Send To All
        </button>
      </div>

      {list.map((user) => {
        const { avatar, name, employee_code, unread_count } = user;
        const isSelected = selectedUser?.employee_code == user.employee_code;
        return (
          <div
            key={employee_code}
            style={{
              padding: "20px",
              borderBottom: "1px solid #ccc",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontWeight: isSelected ? "bold" : "normal",
              backgroundColor: isSelected ? "#eee" : "transparent",
            }}
            onClick={() => onSelect(user)}
          >
            <img
              src={avatar}
              alt=""
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                marginRight: "10px",
              }}
            />
            <span>{name}</span>
            {!!unread_count && (
              <span
                style={{
                  backgroundColor: "#329",
                  borderRadius: "50%",
                  padding: "5px",
                  fontSize: "10px",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#eee",
                  marginLeft: "auto",
                }}
              >
                {unread_count}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default UserList;
