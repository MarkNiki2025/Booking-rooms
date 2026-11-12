
import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function RegisterCard() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const handleRegister = async (e: SubmitEvent) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  try {
    await registerUser(fullName, email, password);
    navigate("/dashboard");
  } catch (error) {
    console.error(error);
    setError("Registration failed");
  }
};

  return (
    <Card className="w-full max-w-sm p-3">
      <CardHeader>
        <CardTitle className="font-bold my-2 text-2xl">
          Create Your Account
        </CardTitle>
        <CardDescription>
          Start booking rooms in minutes.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleRegister}>
        <CardContent>
          <div className="flex flex-col gap-6">

            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Alex Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="test@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2 mt-4">
          <Button type="submit" className="w-full bg-blue-600">
            Create Account
          </Button>

          <CardAction className="w-full flex justify-center">
            <p>
              Already registered?
              <Button
                type="button"
                variant="link"
                onClick={() => navigate("/login")}
                className="text-blue-900 underline cursor-pointer"
              >
                Log in
              </Button>
            </p>
          </CardAction>
        </CardFooter>
      </form>
    </Card>
  );
}

export default RegisterCard;
