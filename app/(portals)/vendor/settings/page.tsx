"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/store";
import { selectUser } from "@/store/slices/authSlice";
import { Save, Store } from "lucide-react";

export default function VendorSettingsPage() {
  const user = useAppSelector(selectUser);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Business Settings</h1>
        <p className="text-muted-foreground">Manage your business profile and settings</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Business Name" defaultValue={user?.name} />
          <Input label="Email" defaultValue={user?.email} type="email" />
          <Input label="Phone" placeholder="Enter business phone" />
          <Input label="Location" placeholder="Enter business location" />
          <Button>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
