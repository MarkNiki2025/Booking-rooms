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
import {useNavigate} from "react-router-dom"

function RegisterCard () { 
    const navigate = useNavigate();
    return(
    <Card className="w-full max-w-sm p-3">
      <CardHeader>
        <CardTitle className="font-bold my-2 text-2xl">Create Your Account</CardTitle>
        <CardDescription>
          Start booking rooms in minutes.
        </CardDescription>
        
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Alex Smith"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" >Email</Label>
              <Input id="email" type="email" placeholder="test@gmail.com" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Confirm Password</Label>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full bg-blue-600">
          Login
        </Button>
        <CardAction className="w-full flex justify-center">
           <p>
            Already registered?
          <Button variant="link" onClick={() => navigate("/login")} className="text-blue-900 underline cursor-pointer">Log in</Button>
          </p>
        </CardAction>
      </CardFooter>
    </Card>
    )
}

export default RegisterCard