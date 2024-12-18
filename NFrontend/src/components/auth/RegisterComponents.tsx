import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import userRegisterService from "@/services/userRegisterService";
import React, { useState } from "react";
import { Progress } from "../ui/progress";
const RegisterComponent = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirm_password, setConfirmPassword] = useState<string>("");
  const [first_name, setFirstName] = useState<string>("");
  const [last_name, setLastName] = useState<string>("");
  const [phone_number, setPhoneNumber] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [successful, setSuccessful] = useState<string | null>(null);

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (
      !email ||
      !password ||
      !confirm_password ||
      !first_name ||
      !last_name ||
      !phone_number
    ) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await userRegisterService.register({
        email,
        password,
        first_name,
        last_name,
        phone_number,
        id: "",
      });
      setSuccessful("Registration successful");

      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFirstName("");
      setLastName("");
      setPhoneNumber("");
    } catch (error: any) {
      setError(
        error.response?.data?.email ||
          error.response?.data?.first_name ||
          error.response?.data?.last_name ||
          error.response?.data?.password ||
          error.response?.data?.phone_number ||
          "Registration failed"
      );
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      {loading && <Progress />}

      <CardHeader>
        <CardTitle className="text-2xl">Register</CardTitle>
        <CardDescription>Create an account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                type="text"
                required
                value={first_name}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                type="text"
                required
                value={last_name}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="text"
                required
                value={phone_number}
                onChange={(event) => setPhoneNumber(event.target.value)}
              />
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="Confrim_password">Confrim Password</Label>
                </div>
                <Input
                  id="Confrim_password"
                  type="password"
                  required
                  value={confirm_password}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
              {error && <p className="mr-4 text-red-600">{error}</p>}
              {successful && (
                <p className="mr-4 text-green-600">{successful}</p>
              )}

              <Button type="submit" className="w-full">
                Register
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterComponent;
