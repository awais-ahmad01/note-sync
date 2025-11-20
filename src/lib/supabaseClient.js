import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function updateUserProfile(data) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const updates = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", userData.user.id)
    .select()
    .single();

  return { data: profile, error };
}

export async function uploadAvatar(file) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  console.log("Uploading avatar for user:", userData);

  const fileExt = file.name.split(".").pop();
  const fileName = `${userData.user.id}/${Math.random()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { data, error };
}

export async function deleteAccount() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  // Delete user profile
  const { error: profileError } = await supabase
    .from("user_profiles")
    .delete()
    .eq("id", userData.user.id);

  if (profileError) throw profileError;

  // Delete user from auth
  const { error: authError } = await supabase.auth.admin.deleteUser(
    userData.user.id
  );

  if (authError) throw authError;
}

// Helper function to get current user profile
export async function getCurrentUserProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userData.user.id)
    .single();

  return { data: profile, error };
}
