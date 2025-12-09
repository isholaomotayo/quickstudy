"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useInstitutionData } from "@/hooks/useDashboardData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Users,
  Settings,
  Save,
  RefreshCw,
  Download,
  Upload,
  Edit,
  Shield,
  Bell,
  FileText,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
  Camera,
  CreditCard,
  Database,
} from "lucide-react";

interface Institution {
  id: number;
  code: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  motto?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  description?: string;
  logo?: string;
  host_name?: string;
  support_mail?: string;
  admission_mail?: string;
  school_calendar?: string;
  director_signature?: string;
  paywall_on?: boolean;
  id_card?: any;
  token?: string;
  calendar_data?: any;
  created_at: string;
  updated_at: string;
}

export default function SettingsConfiguration() {
  const { userData } = useApp();
  const { data: institution, isLoading, error, mutate } = useInstitutionData(userData?.institution_id);
  const [institutionLocal, setInstitutionLocal] = useState<Institution | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (institution) {
      setInstitutionLocal(institution);
    }
  }, [institution]);

  const handleFieldChange = (field: string, value: any) => {
    if (institutionLocal) {
      setInstitutionLocal({
        ...institutionLocal,
        [field]: value,
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = async () => {
    if (!institutionLocal || !userData?.institution_id) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/institution/${userData.institution_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(institutionLocal),
      });

      if (response.ok) {
        const updatedInstitution = await response.json();
        setInstitutionLocal(updatedInstitution);
        setHasUnsavedChanges(false);
        mutate(); // Refresh the data
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!userData?.institution_id) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch(`/api/institution/${userData.institution_id}/logo`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        handleFieldChange('logo', result.logoUrl);
      } else {
        throw new Error('Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleReset = () => {
    if (institution) {
      setInstitutionLocal(institution);
      setHasUnsavedChanges(false);
    }
  };

  const handleExport = () => {
    if (institutionLocal) {
      const dataStr = JSON.stringify(institutionLocal, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${institutionLocal.name.replace(/\s+/g, '_')}_settings.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  if (isLoading && !institution) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Loading institution settings...</p>
        </div>
      </div>
    );
  }

  if (error || !institutionLocal) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Error Loading Settings
            </h2>
            <p className="text-gray-600 mb-4">
              {error || "Unable to load institution data"}
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Institution Settings</h2>
          <p className="text-gray-600">
            Manage your institution's profile and configuration
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {hasUnsavedChanges && (
            <Button 
              variant="outline" 
              onClick={() => {
                if (window.confirm("Are you sure you want to reset all changes? This will discard all unsaved changes.")) {
                  handleReset();
                }
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving || !hasUnsavedChanges}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">You have unsaved changes</p>
                <p className="text-sm text-amber-700">
                  Don't forget to save your changes before leaving this page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            <Building2 className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </TabsTrigger>
          <TabsTrigger
            value="branding"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger
            value="advanced"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Institution Profile */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Institution Profile
                </CardTitle>
                <CardDescription>
                  Basic information about your institution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Institution Name *</Label>
                      <Input
                        id="name"
                        value={institutionLocal.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        placeholder="Enter institution name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="code">Institution Code *</Label>
                      <Input
                        id="code"
                        value={institutionLocal.code}
                        onChange={(e) => handleFieldChange("code", e.target.value)}
                        placeholder="Enter institution code"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motto">Motto</Label>
                      <Input
                        id="motto"
                        value={institutionLocal.motto || ""}
                        onChange={(e) => handleFieldChange("motto", e.target.value)}
                        placeholder="Enter institution motto"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={institutionLocal.description || ""}
                        onChange={(e) => handleFieldChange("description", e.target.value)}
                        placeholder="Brief description of your institution"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Textarea
                        id="address"
                        value={institutionLocal.address}
                        onChange={(e) => handleFieldChange("address", e.target.value)}
                        placeholder="Enter institution address"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Information Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  Primary Contact
                </CardTitle>
                <CardDescription>
                  Main contact information for your institution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Primary Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={institutionLocal.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="admin@institution.edu"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Primary Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={institutionLocal.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    placeholder="+234 xxx xxx xxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={institutionLocal.website || ""}
                    onChange={(e) => handleFieldChange("website", e.target.value)}
                    placeholder="https://www.institution.edu"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Specialized Contacts
                </CardTitle>
                <CardDescription>
                  Department-specific contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="support_mail">Support Email</Label>
                  <Input
                    id="support_mail"
                    type="email"
                    value={institutionLocal.support_mail || ""}
                    onChange={(e) => handleFieldChange("support_mail", e.target.value)}
                    placeholder="support@institution.edu"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admission_mail">Admissions Email</Label>
                  <Input
                    id="admission_mail"
                    type="email"
                    value={institutionLocal.admission_mail || ""}
                    onChange={(e) => handleFieldChange("admission_mail", e.target.value)}
                    placeholder="admissions@institution.edu"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="host_name">Host Name</Label>
                  <Input
                    id="host_name"
                    value={institutionLocal.host_name || ""}
                    onChange={(e) => handleFieldChange("host_name", e.target.value)}
                    placeholder="institution.edu"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  Social Media Presence
                </CardTitle>
                <CardDescription>
                  Connect your social media accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={institutionLocal.facebook || ""}
                      onChange={(e) => handleFieldChange("facebook", e.target.value)}
                      placeholder="https://facebook.com/institution"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={institutionLocal.twitter || ""}
                      onChange={(e) => handleFieldChange("twitter", e.target.value)}
                      placeholder="https://twitter.com/institution"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={institutionLocal.youtube || ""}
                      onChange={(e) => handleFieldChange("youtube", e.target.value)}
                      placeholder="https://youtube.com/institution"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-indigo-600" />
                  Institution Logo
                </CardTitle>
                <CardDescription>
                  Upload and manage your institution's logo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={institutionLocal.logo || ""} alt={institutionLocal.name} />
                    <AvatarFallback className="text-2xl">
                      {institutionLocal.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-gray-600">
                      Upload a logo for your institution. Recommended size: 300x300px
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={uploadingLogo}
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        {uploadingLogo ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        {uploadingLogo ? "Uploading..." : "Upload Logo"}
                      </Button>
                      {institutionLocal.logo && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFieldChange("logo", "")}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(file);
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendar and Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Academic Calendar
                </CardTitle>
                <CardDescription>
                  Manage academic calendar and important documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="school_calendar">Calendar URL</Label>
                  <Input
                    id="school_calendar"
                    value={institutionLocal.school_calendar || ""}
                    onChange={(e) => handleFieldChange("school_calendar", e.target.value)}
                    placeholder="https://calendar.google.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="director_signature">Director Signature URL</Label>
                  <Input
                    id="director_signature"
                    value={institutionLocal.director_signature || ""}
                    onChange={(e) => handleFieldChange("director_signature", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Settings Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-orange-600" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Advanced system settings and configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Paywall</Label>
                    <p className="text-sm text-muted-foreground">
                      Require payment before accessing courses
                    </p>
                  </div>
                  <Switch
                    checked={institutionLocal.paywall_on || false}
                    onCheckedChange={(checked) => handleFieldChange("paywall_on", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="token">API Token</Label>
                  <div className="flex gap-2">
                    <Input
                      id="token"
                      type="password"
                      value={institutionLocal.token || ""}
                      onChange={(e) => handleFieldChange("token", e.target.value)}
                      placeholder="Enter API token"
                    />
                    <Button variant="outline" size="sm">
                      Generate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Backup and data management options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <p><strong>Created:</strong> {new Date(institutionLocal.created_at).toLocaleDateString()}</p>
                  <p><strong>Last Updated:</strong> {new Date(institutionLocal.updated_at).toLocaleDateString()}</p>
                  <p><strong>Institution ID:</strong> {institutionLocal.id}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Backup Institution Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Calendar and ID Card Configuration */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  ID Card & Calendar Configuration
                </CardTitle>
                <CardDescription>
                  Advanced configuration for ID cards and calendar data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ID Card Configuration</Label>
                    <div className="p-3 border rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600">
                        {institutionLocal.id_card 
                          ? "Custom ID card template configured" 
                          : "Using default ID card template"
                        }
                      </p>
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                        Configure ID Cards
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Calendar Data</Label>
                    <div className="p-3 border rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600">
                        {institutionLocal.calendar_data 
                          ? "Custom calendar configuration active" 
                          : "Using default calendar settings"
                        }
                      </p>
                      <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                        Configure Calendar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}