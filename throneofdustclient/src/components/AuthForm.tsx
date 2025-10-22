import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, ApiError } from "@/services/api";
import {
  loginSchema,
  registerSchema,
  LoginFormData,
  RegisterFormData,
} from "@/schemas/auth";

interface AuthFormProps {
  onAuthSuccess: (token: string) => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const response = await api.auth(endpoint, {
        username: data.username,
        password: data.password,
      });
      onAuthSuccess(response.token);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unexpected error");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    reset();
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg"
      >
        <h2 className="text-xl font-bold mb-4 text-yellow-400 text-center">
          {isRegister ? "Register" : "Login"}
        </h2>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Username</label>
          <input
            type="text"
            {...register("username")}
            className={`w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 ${
              errors.username
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-yellow-500"
            }`}
            placeholder="Enter your username"
          />
          {errors.username && (
            <p className="text-red-400 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Password</label>
          <input
            type="password"
            {...register("password")}
            className={`w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-yellow-500"
            }`}
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {isRegister && (
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword")}
              className={`w-full px-3 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 ${
                "confirmPassword" in errors && errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-yellow-500"
              }`}
              placeholder="Confirm your password"
            />
            {"confirmPassword" in errors && errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Processing..." : isRegister ? "Register" : "Login"}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-blue-400 underline hover:text-blue-300 transition-colors"
            onClick={toggleMode}
          >
            {isRegister
              ? "Already have an account? Login"
              : "No account? Register"}
          </button>
        </div>
      </form>
    </div>
  );
}
