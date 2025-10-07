"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// removed unused multi-step UI imports
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
// import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
// import { Separator } from "@/components/ui/separator";
// import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { createMockCourier } from "@/lib/mock/couriers";

// Minimal single-step schema for Super Admin creation
const courierCreationSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number")
    .min(10, "Phone number must be at least 10 characters")
});

type CourierCreationFormData = z.infer<typeof courierCreationSchema>;

interface CourierCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (courier: any) => void;
}

// Single-step only: no additional steps or selection datasets required

export const CourierCreationModal = ({ isOpen, onClose, onSuccess }: CourierCreationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const { showSuccessToast, showErrorToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CourierCreationFormData>({
    resolver: zodResolver(courierCreationSchema)
  });

  // no next/previous in single-step

  const handleClose = () => {
    if (isSubmitting) return;
    
    reset();
    setSubmitProgress(0);
    onClose();
  };

  const onSubmit = async (data: CourierCreationFormData) => {
    setIsSubmitting(true);
    setSubmitProgress(0);

    try {
      // Simulate account creation process with progress updates
      const steps = [
        { progress: 20, message: "Validating courier information..." },
        { progress: 40, message: "Creating courier account..." },
        { progress: 60, message: "Setting up service area..." },
        { progress: 80, message: "Configuring availability..." },
        { progress: 100, message: "Account created successfully!" }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setSubmitProgress(step.progress);
      }

      // Create minimal courier with defaults
      const parts = data.fullName.trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ");
      const username = data.email.split("@")[0];
      const newCourier = createMockCourier({
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
        username,
        status: "pending_verification"
      });

      showSuccessToast(
        "Courier Account Created Successfully!",
        { duration: 4000, showProgressBar: true, showCloseButton: true }
      );

      onSuccess(newCourier);
      handleClose();
    } catch (error) {
      showErrorToast(
        "Error Creating Courier Account",
        { duration: 5000, showCloseButton: true }
      );
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  const isValidSingleStep = () => {
    return !errors.fullName && !errors.email && !errors.password && !errors.phone;
  };

  const renderStepContent = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            {...register("fullName")}
            className={errors.fullName ? "border-red-500" : ""}
            placeholder="Enter full name"
          />
          {errors.fullName && (
            <p className="text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            {...register("password")}
            className={errors.password ? "border-red-500" : ""}
            placeholder="Enter a password"
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            className={errors.phone ? "border-red-500" : ""}
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden bg-white">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Icon name="UserPlus" size={24} />
            Create New Courier Account
          </DialogTitle>
          <DialogDescription>
            Add a new courier to the Parcego platform. Fill out all required information to create their account.
          </DialogDescription>
        </DialogHeader>

        {/* Single-step creation - no step progress */}

        {/* No step indicator in single-step */}

        {/* No separator needed for stepper */}

        {/* Form Content */}
        <div className="max-h-[400px] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {renderStepContent()}
          </form>
        </div>

        {/* Submit Progress */}
        {isSubmitting && (
          <div className="space-y-4">
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Creating courier account...</span>
                <span>{submitProgress}%</span>
              </div>
              <Progress value={submitProgress} className="h-2" />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Cancel"}
          </Button>
          
          <div className="flex space-x-2">
            <Button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={!isValidSingleStep() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Creating Account..." : "Create Courier Account"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourierCreationModal;
