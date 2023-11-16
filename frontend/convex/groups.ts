import { mutation, query } from "./_generated/server";

export const add = mutation(async ({ db }, group: any) => {
  const existing = await db
    .query("groups")
    .withIndex("by_group_id", (q) =>
      q.eq("group_id", group.group_id)
    )
    .first();
  if (existing) {
    await db.patch(existing._id, group);
    return existing;
  } else {
    const id = await db.insert("groups", group);
    return await db.get(id);
  }
});

export const get = query(
  async ({ db }, { group_id }: { group_id: string }) => {
    return await db
      .query("groups")
      .withIndex("by_group_id", (q) =>
        q.eq("group_id", group_id)
      )
      .first();
  }
);

export const list = query(async ({ db }) => {
  return await db.query("groups").collect();
});

export const update = mutation(
  async ({ db }, { group_id, payload }: { group_id: string; payload: any }) => {
    const existing = await db
      .query("groups")
      .withIndex("by_group_id", (q) =>
        q.eq("group_id", group_id)
      )
      .first();
    if (existing) {
      db.patch(existing._id, payload);
    }
  }
);
