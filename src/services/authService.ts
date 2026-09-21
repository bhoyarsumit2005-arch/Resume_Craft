import { api, storeToken } from "./api";
import type { User } from "@/lib/resume-types";

type AuthResponse = { user: User; token: string };

export const authService = {
  async sendRegistrationOtp(name: string, email: string, password: string) {
    return api<{ message: string }>("/auth/register/send-otp", { method: "POST", body: { name, email, password } });
  },
  async verifyRegistrationOtp(email: string, otp: string) {
    const data = await api<AuthResponse>("/auth/register/verify", { method: "POST", body: { email, otp } });
    storeToken(data.token);
    return data.user;
  },
  async login(email: string, password: string) {
    const data = await api<AuthResponse>("/auth/login", { method: "POST", body: { email, password } });
    storeToken(data.token);
    return data.user;
  },
  async me() {
    const data = await api<{ user: User }>("/auth/me");
    return data.user;
  },
  async logout() {
    storeToken(null);
    await api("/auth/logout", { method: "POST" });
  },
  async updateProfile(payload: { name?: string; currentPassword?: string; newPassword?: string }) {
    const data = await api<{ user: User }>("/profile", { method: "PUT", body: payload });
    return data.user;
  },
  async forgotPassword(email: string) {
    return api<{ message: string }>("/auth/forgot-password", { method: "POST", body: { email } });
  },
  async verifyOtp(email: string, otp: string) {
    return api<{ resetToken: string }>("/auth/verify-otp", { method: "POST", body: { email, otp } });
  },
  async resetPassword(resetToken: string, newPassword: string) {
    return api<{ message: string }>("/auth/reset-password", { method: "POST", body: { resetToken, newPassword } });
  },
};
