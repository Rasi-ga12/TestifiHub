
/* import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { X, Eye, EyeOff } from "lucide-react";
import axios from "axios";

export default function ForgotPassword() {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [emailForReset, setEmailForReset] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(true); // Initially, it's possible to resend OTP

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!emailForReset) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(emailForReset)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
     try {
    const res = await axios.post("http://127.0.0.1:5000/send-otp", { email: emailForReset });
    if (res.status === 200) {
      toast({
        title: "OTP Sent",
        description: res.data?.message || `An OTP has been sent to ${emailForReset}`,
      });
      setStep("otp");
      setResendTimer(30);
      setCanResend(false);
      let timer = 30;
      const interval = setInterval(() => {
        timer--;
        setResendTimer(timer);
        if (timer <= 0) {
          clearInterval(interval);
          setCanResend(true);
        }
      }, 1000);
    } else {
      toast({
        title: "Error",
        description: res.data?.message || "Failed to send OTP.",
        variant: "destructive",
      });
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to send OTP.",
      variant: "destructive",
    });
  }

  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the OTP.",
        variant: "destructive",
      });
      return;
    }

    if (otp.length !== 6 || isNaN(Number(otp))) {
      toast({
        title: "Error",
        description: "OTP must be a 6-digit number.",
        variant: "destructive",
      });
      return;
    }
      try {
    const res = await axios.post("http://127.0.0.1:5000/verify-otp", { email: emailForReset, otp });
    if (res.status === 200) {
      toast({
        title: "Success",
        description: res.data?.message || "OTP verified successfully!",
      });
      setStep("reset");
    } else {
      toast({
        title: "Error",
        description: res.data?.message || "Invalid OTP.",
        variant: "destructive",
      });
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to verify OTP.",
      variant: "destructive",
    });
  }

  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in both password fields.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
      try {
    const res = await axios.post("http://127.0.0.1:5000/reset-password", {
      actions: "reset_password",
      email: emailForReset,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    if (res.status === 200) {
      toast({
        title: "Password Reset Success",
        description: res.data?.message || "Your password has been successfully reset.",
      });
      setIsDialogOpen(false);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } else {
      toast({
        title: "Error",
        description: res.data?.message || "Failed to reset password.",
        variant: "destructive",
      });
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to reset password.",
      variant: "destructive",
    });
  }
  };

  const handleDialogClose = () => {
    if (step === "reset") {
      setStep("otp");
    } else if (step === "otp") {
      setStep("email");
    } else {
      setIsDialogOpen(false);
      navigate("/login");
    }
  };

  useEffect(() => {
    // Reset the resend timer if the dialog is closed or email step is opened
    if (step === "email") {
      setResendTimer(30);
      setCanResend(true);
    }
  }, [step]);

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
      if (!open && (step === "email" || step === "otp" || step === "reset")) {
        return;
      }
      setIsDialogOpen(open);
      }}
      >
      <DialogContent className="sm:max-w-md fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === "email" && "Forgot Password"}
            {step === "otp" && "Verify OTP"}
            {step === "reset" && "Reset Password"}
          </DialogTitle>
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            onClick={handleDialogClose}
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        {step === "email" && (
          <div className="space-y-4 mt-4">
            <Input
              type="email"
              placeholder="Enter your registered email"
              value={emailForReset}
              onChange={(e) => setEmailForReset(e.target.value)}
            />
            <Button
              onClick={handleSendOtp}
              disabled={!emailForReset}
              className="w-full"
            >
              Send OTP
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4 mt-4">
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button
              onClick={handleVerifyOtp}
              disabled={!otp}
              className="w-full"
            >
              Verify OTP
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleSendOtp}
              disabled={!canResend}
            >
              {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
            </Button>
          </div>
        )}

        {step === "reset" && (
          <div className="space-y-4 mt-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <Button
              onClick={handleResetPassword}
              disabled={
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
              }
              className="w-full"
            >
              Reset Password
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} */
/*
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

export default function ForgotPassword() {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [emailForReset, setEmailForReset] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");

    if (step === "email") {
      setResendTimer(30);
      setCanResend(true);
    }
  }, [step]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (!canResend) {
      let timer = 30;
      intervalId = setInterval(() => {
        timer--;
        setResendTimer(timer);
        if (timer <= 0) {
          clearInterval(intervalId);
          setCanResend(true);
        }
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [canResend]);

  const handleSendOtp = async () => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(emailForReset)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sending OTP...",
    });
    //new
     try {
    const res = await axios.post("http://127.0.0.1:5000/send-otp", { email: emailForReset });
    if (res.status === 200) {
      toast({
        title: "OTP Sent",
        description: res.data?.message || `An OTP has been sent to ${emailForReset}`,
      });
      setStep("otp");
      setResendTimer(30);
      setCanResend(false);
      let timer = 30;
      const interval = setInterval(() => {
        timer--;
        setResendTimer(timer);
        if (timer <= 0) {
          clearInterval(interval);
          setCanResend(true);
        }
      }, 1000);
    } else {
      toast({
        title: "Error",
        description: res.data?.message || "Failed to send OTP.",
        variant: "destructive",
      });
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to send OTP.",
      variant: "destructive",
    });
  }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6 || isNaN(Number(otp))) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Verifying OTP...",
    });
     try {
    const res = await axios.post("http://127.0.0.1:5000/verify-otp", { email: emailForReset, otp });
    if (res.status === 200) {
      toast({
        title: "Success",
        description: res.data?.message || "OTP verified successfully!",
      });
      setStep("reset");
    } else {
      toast({
        title: "Error",
        description: res.data?.message || "Invalid OTP.",
        variant: "destructive",
      });
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to verify OTP.",
      variant: "destructive",
    });
  }

  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in both password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Resetting Password...",
    });
     try {
    const res = await axios.post("http://127.0.0.1:5000/reset-password", {
      actions: "reset_password",
      email: emailForReset,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    if (res.status === 200) {
      toast({
        title: "Password Reset Success",
        description: res.data?.message || "Your password has been successfully reset.",
      });
      setIsDialogOpen(false);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } else {
      toast({
        title: "Error",
        description: res.data?.message || "Failed to reset password.",
        variant: "destructive",
      });
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to reset password.",
      variant: "destructive",
    });
  }
  };

  const handleDialogClose = () => {
    if (step === "reset") {
      setStep("otp");
    } else if (step === "otp") {
      setStep("email");
    } else {
      setIsDialogOpen(false);
      navigate("/login");
    }
  };
  const inputStyle =
    "bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-blue-500 shadow-none transition-none";
  const buttonStyle =
    "w-full bg-blue-500 text-white rounded-md shadow-none transition-none hover:bg-blue-500 active:bg-blue-500";
  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg text-black transition-none">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === "email" && "Forgot Password"}
            {step === "otp" && "Verify OTP"}
            {step === "reset" && "Reset Password"}
          </DialogTitle>
        </DialogHeader>

        {step === "email" && (
          <div className="space-y-4 mt-4">
            <Input
              type="email"
              placeholder="Enter your registered email"
              className={inputStyle}
              value={emailForReset}
              onChange={(e) => setEmailForReset(e.target.value)}
            />
            <Button
              onClick={handleSendOtp}
              disabled={!emailForReset}
              className={buttonStyle}
            >
              Send OTP
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4 mt-4">
            <Input
              type="text"
              className={inputStyle}
              placeholder="Enter OTP (Hint: 123456)"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button
              onClick={handleVerifyOtp}
              className={buttonStyle}
              disabled={!otp}
              
            >
              Verify OTP
            </Button>
            <Button
              variant="outline"
              className={buttonStyle}
              onClick={handleSendOtp}
              disabled={!canResend}
            >
              {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
            </Button>
          </div>
        )}

        {step === "reset" && (
          <div className="space-y-4 mt-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              onClick={handleResetPassword}
              disabled={
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
              }
              className="w-full"
            >
              Reset Password
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

export default function ForgotPassword() {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [emailForReset, setEmailForReset] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");

    if (step === "email") {
      setResendTimer(30);
      setCanResend(true);
    }
  }, [step]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (!canResend) {
      let timer = 30;
      intervalId = setInterval(() => {
        timer--;
        setResendTimer(timer);
        if (timer <= 0) {
          clearInterval(intervalId);
          setCanResend(true);
        }
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [canResend]);

  const handleSendOtp = async () => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(emailForReset)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sending OTP...",
    });
    //new
     try {
    const res = await axios.post("http://127.0.0.1:5000/send-otp", { email: emailForReset });
    if (res.status === 200) {
      toast({
        title: "OTP Sent",
        description: res.data?.message || `An OTP has been sent to ${emailForReset}`,
      });
      setStep("otp");
      setResendTimer(30);
      setCanResend(false);
      let timer = 30;
      const interval = setInterval(() => {
        timer--;
        setResendTimer(timer);
        if (timer <= 0) {
          clearInterval(interval);
          setCanResend(true);
        }
      }, 1000);
    } else {
      toast({
        title: "Error",
        description: res.data?.message || "Failed to send OTP.",
        variant: "destructive",
      });
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to send OTP.",
      variant: "destructive",
    });
  }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6 || isNaN(Number(otp))) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Verifying OTP...",
    });
     try {
    const res = await axios.post("http://127.0.0.1:5000/verify-otp", { email: emailForReset, otp });
    if (res.status === 200) {
      toast({
        title: "Success",
        description: res.data?.message || "OTP verified successfully!",
      });
      setStep("reset");
    } else {
      toast({
        title: "Error",
        description: res.data?.message || "Invalid OTP.",
        variant: "destructive",
      });
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to verify OTP.",
      variant: "destructive",
    });
  }

  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in both password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Resetting Password...",
    });
     try {
    const res = await axios.post("http://127.0.0.1:5000/reset-password", {
      actions: "reset_password",
      email: emailForReset,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    if (res.status === 200) {
      toast({
        title: "Password Reset Success",
        description: res.data?.message || "Your password has been successfully reset.",
      });
      setIsDialogOpen(false);
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } else {
      toast({
        title: "Error",
        description: res.data?.message || "Failed to reset password.",
        variant: "destructive",
      });
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to reset password.",
      variant: "destructive",
    });
  }
  };

  const handleDialogClose = () => {
    if (step === "reset") {
      setStep("otp");
    } else if (step === "otp") {
      setStep("email");
    } else {
      setIsDialogOpen(false);
      navigate("/login");
    }
  };

  const inputStyle =
    "bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-blue-500 shadow-none transition-none";
  const buttonStyle =
    "w-full bg-blue-500 text-white rounded-md shadow-none transition-none hover:bg-blue-500 active:bg-blue-500";


  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg text-black transition-none">
        <DialogHeader>
          <DialogTitle className="text-center">
            {step === "email" && "Forgot Password"}
            {step === "otp" && "Verify OTP"}
            {step === "reset" && "Reset Password"}
          </DialogTitle>
        </DialogHeader>

        {step === "email" && (
          <div className="space-y-4 mt-4">
            <Input
              type="email"
              placeholder="Enter your registered email"
              value={emailForReset}
              className={inputStyle}
              onChange={(e) => setEmailForReset(e.target.value)}
            />
            <Button
              onClick={handleSendOtp}
              disabled={!emailForReset}
              className={buttonStyle}
            >
              Send OTP
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4 mt-4">
            <Input
              type="text"
              placeholder="Enter OTP (Hint: 123456)"
              value={otp}
              className={inputStyle}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button
              onClick={handleVerifyOtp}
              disabled={!otp}
              className={buttonStyle}
            >
              Verify OTP
            </Button>
            <Button
              variant="outline"
              className="w-full border border-blue-500 text-blue-500 bg-white hover:bg-white shadow-none transition-none"
              onClick={handleSendOtp}
              disabled={!canResend}
            >
              {canResend ? "Resend OTP" : ` Resend in ${resendTimer}s`}
            </Button>
          </div>
        )}

        {step === "reset" && (
          <div className="space-y-4 mt-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                className={inputStyle}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                className={inputStyle}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              onClick={handleResetPassword}
              disabled={
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
              }
              className={buttonStyle}
            >
              Reset Password
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}