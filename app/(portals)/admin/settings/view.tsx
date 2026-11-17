"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Save,
  Upload,
} from "lucide-react";
import { AvatarRoot as Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsView() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Vega Service Portal",
    siteDescription: "Your one-stop solution for home services",
    contactEmail: "support@Vega.com",
    contactPhone: "+91 1800 123 4567",
    address: "123 Business Park, Mumbai, India",
    timezone: "Asia/Kolkata",
    currency: "INR",
    language: "en",
  });

  const [profileSettings, setProfileSettings] = useState({
    name: "Admin User",
    email: "admin@Vega.com",
    phone: "+91 98765 43210",
    bio: "Platform administrator",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newBooking: true,
    bookingCancelled: true,
    vendorRegistration: true,
    lowRating: true,
    dailyReport: false,
    weeklyReport: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: "30",
    ipWhitelist: "",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">Manage your platform settings</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure your platform's basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={generalSettings.contactPhone}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) =>
                      setGeneralSettings({ ...generalSettings, timezone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={generalSettings.currency}
                    onValueChange={(value) =>
                      setGeneralSettings({ ...generalSettings, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={generalSettings.language}
                    onValueChange={(value) =>
                      setGeneralSettings({ ...generalSettings, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="mr">Marathi</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={generalSettings.address}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, address: e.target.value })
                  }
                />
              </div>

              <Button className="bg-red-600 hover:bg-red-700">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/avatars/admin.png" />
                  <AvatarFallback className="text-2xl">AU</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileSettings.name}
                    onChange={(e) =>
                      setProfileSettings({ ...profileSettings, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) =>
                      setProfileSettings({ ...profileSettings, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileSettings.phone}
                    onChange={(e) =>
                      setProfileSettings({ ...profileSettings, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileSettings.bio}
                  onChange={(e) =>
                    setProfileSettings({ ...profileSettings, bio: e.target.value })
                  }
                />
              </div>

              <Button className="bg-red-600 hover:bg-red-700">
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Notification Channels</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-500">Receive browser push notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          pushNotifications: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-500">Receive SMS for critical alerts</p>
                    </div>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          smsNotifications: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Alert Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Booking</p>
                      <p className="text-sm text-gray-500">When a new booking is created</p>
                    </div>
                    <Switch
                      checked={notificationSettings.newBooking}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          newBooking: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Booking Cancelled</p>
                      <p className="text-sm text-gray-500">When a booking is cancelled</p>
                    </div>
                    <Switch
                      checked={notificationSettings.bookingCancelled}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          bookingCancelled: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Vendor Registration</p>
                      <p className="text-sm text-gray-500">When a vendor applies to join</p>
                    </div>
                    <Switch
                      checked={notificationSettings.vendorRegistration}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          vendorRegistration: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Low Rating Alert</p>
                      <p className="text-sm text-gray-500">When a vendor receives low rating</p>
                    </div>
                    <Switch
                      checked={notificationSettings.lowRating}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          lowRating: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Reports</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Daily Report</p>
                      <p className="text-sm text-gray-500">Receive daily summary report</p>
                    </div>
                    <Switch
                      checked={notificationSettings.dailyReport}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          dailyReport: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Report</p>
                      <p className="text-sm text-gray-500">Receive weekly summary report</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReport}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          weeklyReport: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button className="bg-red-600 hover:bg-red-700">
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) =>
                      setSecuritySettings({
                        ...securitySettings,
                        twoFactorEnabled: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Select
                  value={securitySettings.sessionTimeout}
                  onValueChange={(value) =>
                    setSecuritySettings({ ...securitySettings, sessionTimeout: value })
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Change Password</h3>
                <div className="grid gap-4 max-w-md">
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
              </div>

              <Button className="bg-red-600 hover:bg-red-700">
                <Save className="mr-2 h-4 w-4" />
                Update Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>Manage payment methods and billing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-500">Expires 12/25</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>

              <Button variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>

              <div className="space-y-4">
                <h3 className="font-medium">Billing Address</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Street Address</Label>
                    <Input placeholder="123 Business Park" />
                  </div>
                  <div className="grid gap-2">
                    <Label>City</Label>
                    <Input placeholder="Mumbai" />
                  </div>
                  <div className="grid gap-2">
                    <Label>State</Label>
                    <Input placeholder="Maharashtra" />
                  </div>
                  <div className="grid gap-2">
                    <Label>ZIP Code</Label>
                    <Input placeholder="400001" />
                  </div>
                </div>
              </div>

              <Button className="bg-red-600 hover:bg-red-700">
                <Save className="mr-2 h-4 w-4" />
                Save Billing Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Theme</h3>
                <div className="grid grid-cols-3 gap-4 max-w-md">
                  <button className="p-4 border-2 border-red-600 rounded-lg text-center">
                    <div className="h-8 w-full bg-white border rounded mb-2"></div>
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button className="p-4 border rounded-lg text-center hover:border-gray-400">
                    <div className="h-8 w-full bg-gray-900 rounded mb-2"></div>
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                  <button className="p-4 border rounded-lg text-center hover:border-gray-400">
                    <div className="h-8 w-full bg-gradient-to-r from-white to-gray-900 rounded mb-2"></div>
                    <span className="text-sm font-medium">System</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Accent Color</h3>
                <div className="flex gap-3">
                  <button className="h-8 w-8 rounded-full bg-red-600 ring-2 ring-offset-2 ring-red-600"></button>
                  <button className="h-8 w-8 rounded-full bg-blue-600 hover:ring-2 hover:ring-offset-2 hover:ring-blue-600"></button>
                  <button className="h-8 w-8 rounded-full bg-green-600 hover:ring-2 hover:ring-offset-2 hover:ring-green-600"></button>
                  <button className="h-8 w-8 rounded-full bg-purple-600 hover:ring-2 hover:ring-offset-2 hover:ring-purple-600"></button>
                  <button className="h-8 w-8 rounded-full bg-orange-600 hover:ring-2 hover:ring-offset-2 hover:ring-orange-600"></button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Sidebar</h3>
                <div className="flex items-center justify-between max-w-md">
                  <div>
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-sm text-gray-500">Use icons only in sidebar</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button className="bg-red-600 hover:bg-red-700">
                <Save className="mr-2 h-4 w-4" />
                Save Appearance
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
