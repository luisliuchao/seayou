import { query, mutation } from "./_generated/server";

export const _list = query({
  args: {},
  handler: async (ctx) => {
    // Grab the most recent messages.
    const messages = await ctx.db.query("messages").order("desc").take(100);
    // Reverse the list so that it's in a chronological order.
    return messages.reverse();
  },
});

export const list = query(
  async ({ db }, { employeeCode }: { employeeCode: string }) => {
    return await db
      .query("messages")
      .withIndex("by_employee_code", (q) => q.eq("employee_code", employeeCode))
      .collect();
  }
);

export const add = mutation(async ({ db }, message: any) => {
  await db.insert("messages", message);
});
