import { useState } from "react";
import axiosClient from "../../api/axiosClient";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithGoogle = async (googleToken: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.post("/auth/google-login/", {
        token: googleToken,
      });

      console.log("✅ Logged in:", res.data);
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loginWithGoogle,
    loading,
    error,
  };
};
