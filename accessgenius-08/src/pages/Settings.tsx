
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsSecurity from '@/components/settings/SettingsSecurity';

const Settings = () => {
  return (
    <MainLayout>
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
          <SettingsSecurity />
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
