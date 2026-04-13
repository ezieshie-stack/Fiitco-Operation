import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberFirstName, memberPhone, guestFirstName, guestPhone } = body;

    if (!memberFirstName || !memberPhone || !guestFirstName || !guestPhone) {
      return Response.json({ success: false, message: "All fields are required." }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await fetchMutation((api as any).guestPasses.create, {
      memberFirstName,
      memberPhone,
      guestFirstName,
      guestPhone,
    });

    if (!result.success) {
      return Response.json({ success: false, message: result.message }, { status: 422 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("guest-passes POST error:", err);
    return Response.json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
