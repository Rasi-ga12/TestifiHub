import React from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RegisterForm } from "@/components/auth/RegisterForm"
import AuthPageLayout from "@/components/layout/AuthLayout"
import { useBreakpoint } from "@/hooks/use-mobile"

export default function RegisterPage() {
  const { isMobile, isTablet } = useBreakpoint();

  const content = (
      <div className="container max-w-lg mx-auto py-8">
        <Card className="glass-card">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Register for your AccessPro account</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
  );
  return isMobile || isTablet ? <AuthPageLayout>{content}</AuthPageLayout> : <MainLayout>{content}</MainLayout>;
}