import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router";
import { useState } from "react";
import type { SubmitEvent } from "react";
import { loginUser } from "../services/authService";
function LoginCard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogIn = async (e: SubmitEvent) => {
    e.preventDefault();
  
    try {
      loginUser(email,password)
      .then(() => {
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error(error);
        setError("Login failed");
      })
      } catch (error) {
        setError("Login failed");
        console.error(error);
      }
  };
  return (
    <Card className="w-full max-w-sm p-3">
      <CardHeader>
        <CardTitle className="text-blue-900 font-bold my-5 text-2xl">Meet Space</CardTitle>
        <CardTitle className="font-bold">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to book and join meetings.
        </CardDescription>
        
      </CardHeader>
      <form onSubmit={handleLogIn}>
      <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" onSubmit={handleLogIn} className="w-full bg-blue-600 cursor-pointer">
          Login
        </Button>
        <CardAction className="w-full flex justify-center">
           <p>
            No account? 
          <Button variant="link" onClick={() => navigate("/register")} className="text-blue-900 underline cursor-pointer" >Create one</Button>
          </p>
        </CardAction>
         {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
      </CardFooter>
      </form>
    </Card>
  )
}

export default LoginCard;