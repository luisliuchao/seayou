import { mutation, query } from "./_generated/server";

export const add = mutation(async ({ db }, employee: any) => {
  const existing = await db
    .query("users")
    .withIndex("by_employee_code", (q) =>
      q.eq("employee_code", employee.employee_code)
    )
    .first();
  if (existing) {
    await db.patch(existing._id, employee);
    return existing;
  } else {
    const id = await db.insert("users", employee);
    return await db.get(id);
  }
});

export const get = query(
  async ({ db }, { employee_code }: { employee_code: string }) => {
    return await db
      .query("users")
      .withIndex("by_employee_code", (q) =>
        q.eq("employee_code", employee_code)
      )
      .first();
  }
);

export const list = query(async ({ db }) => {
  return await db.query("users").collect();
});

export const update = mutation(
  async ({ db }, { id, payload }: { id: any; payload: any }) => {
    db.patch(id, payload);
  }
);
