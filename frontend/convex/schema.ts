import { defineSchema, defineTable } from "convex/server";
import { v as s } from "convex/values";

export default defineSchema({
  users: defineTable({
    avatar: s.string(),
    custom_fields: s.array(
      s.object({
        name: s.string(),
        type: s.number(),
        value: s.string(),
        link_entry_icons: s.array(s.string()),
        link_entry_text: s.string(),
      })
    ),
    departments: s.array(s.string()),
    email: s.string(),
    employee_code: s.string(),
    gender: s.number(),
    is_subscriber: s.optional(s.boolean()),
    last_message_at: s.optional(s.number()),
    mobile: s.string(),
    name: s.string(),
    reporting_manager_employee_code: s.string(),
    seatalk_id: s.string(),
    seatalk_nickname: s.string(),
    subscribed_at: s.optional(s.number()),
    unread_count: s.optional(s.number()),
  }).index("by_employee_code", ["employee_code"]),
  messages: defineTable({
    body: s.string(),
    body_type: s.number(),
    direction: s.number(),
    employee_code: s.optional(s.string()),
    group_id: s.optional(s.string()),
    group_name: s.optional(s.string()),
  })
    .index("by_employee_code", ["employee_code"])
    .index("by_group_id", ["group_id"]),
  groups: defineTable({
    group_id: s.string(),
    group_name: s.string(),
    is_subscriber: s.optional(s.boolean()),
    unread_count: s.optional(s.number()),
    last_message_at: s.optional(s.number()),
  }).index("by_group_id", ["group_id"]),
});
