import { getUserById, updateUser, deactivateUser, reactivateUser } from "@/lib/supabase/domains/users";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(user, { status: 200 });

  } catch (error) {
    console.error("GET /api/users/[id] error:", error);

    return Response.json(
      { error: "Failed to fetch user", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const user = await updateUser(id, data);

    return Response.json(user, { status: 200 });

  } catch (error) {
    console.error("PUT /api/users/[id] error:", error);

    return Response.json(
      { error: "Failed to update user", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const user = await deactivateUser(id);

    return Response.json(user, { status: 200 });

  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);

    return Response.json(
      { error: "Failed to deactivate user", message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const user = await reactivateUser(id);

    return Response.json(user, { status: 200 });

  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);

    return Response.json(
      { error: "Failed to reactivate user", message: error.message },
      { status: 500 }
    );
  }
}
