"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/store";
import { selectUser } from "@/store/slices/authSlice";
import { Save, User } from "lucide-react";

export default function ServiceBoySettingsPage() {
  const user = useAppSelector(selectUser);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Full Name" defaultValue={user?.name} />
          <Input label="Email" defaultValue={user?.email} type="email" />
          <Input label="Phone" placeholder="Enter your phone number" />
          <Button>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
