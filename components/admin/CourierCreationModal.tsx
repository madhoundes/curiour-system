"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { AdminService } from "@/lib/api/admin";
import { AdminCreateUserRequest } from "@/lib/api/types";

// Schema matching AdminCreateUserRequest interface
const courierCreationSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  business_name: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters"),
  role: z.enum(["user", "driver", "admin"]).refine(val => val !== undefined, {
    message: "Please select a role"
  })
});

type CourierCreationFormData = z.infer<typeof courierCreationSchema>;

interface CourierCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const CourierCreationModal = ({ isOpen, onClose, onSuccess }: CourierCreationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const { showSuccessToast, showErrorToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<CourierCreationFormData>({
    resolver: zodResolver(courierCreationSchema),
    defaultValues: {
      role: "driver" // Default to driver role for courier creation
    }
  });

  const selectedRole = watch("role");

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
      // Progress updates for better UX
      const steps = [
        { progress: 20, message: "Validating user information..." },
        { progress: 40, message: "Creating user account..." },
        { progress: 60, message: "Setting up permissions..." },
        { progress: 80, message: "Finalizing account..." },
        { progress: 100, message: "Account created successfully!" }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setSubmitProgress(step.progress);
      }

      // Create user using AdminService
      const adminService = new AdminService();
      const createUserRequest: AdminCreateUserRequest = {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        business_name: data.business_name,
        role: data.role,
        password: data.password
      };

      const response = await adminService.createUser(createUserRequest);

      showSuccessToast(
        `${data.role === 'driver' ? 'Courier' : 'User'} Account Created Successfully!`,
        { 
          duration: 4000, 
          showProgressBar: true, 
          showCloseButton: true 
        }
      );

      onSuccess(response);
      handleClose();
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      let errorMessage = "Error Creating Account";
      let errorDescription = "Please try again.";

      // Handle specific API errors
      if (error?.response?.status === 422) {
        errorMessage = "Validation Error";
        errorDescription = "Please check your input and try again.";
      } else if (error?.response?.status === 409) {
        errorMessage = "Email Already Exists";
        errorDescription = "A user with this email already exists.";
      } else if (error?.message) {
        errorDescription = error.message;
      }

      showErrorToast(
        `${errorMessage}: ${errorDescription}`,
        { 
          duration: 5000, 
          showCloseButton: true
        }
      );
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  const isValidSingleStep = () => {
    return !errors.first_name && !errors.last_name && !errors.email && !errors.password && !errors.business_name && !errors.role;
  };

  const renderStepContent = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              {...register("first_name")}
              className={errors.first_name ? "border-red-500" : ""}
              placeholder="Enter first name"
            />
            {errors.first_name && (
              <p className="text-sm text-red-600">{errors.first_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              {...register("last_name")}
              className={errors.last_name ? "border-red-500" : ""}
              placeholder="Enter last name"
            />
            {errors.last_name && (
              <p className="text-sm text-red-600">{errors.last_name.message}</p>
            )}
          </div>
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
          <Label htmlFor="business_name">Business Name *</Label>
          <Input
            id="business_name"
            {...register("business_name")}
            className={errors.business_name ? "border-red-500" : ""}
            placeholder="Enter business name"
          />
          {errors.business_name && (
            <p className="text-sm text-red-600">{errors.business_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select
            value={selectedRole}
            onValueChange={(value) => setValue("role", value as "user" | "driver" | "admin")}
          >
            <SelectTrigger className={errors.role ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="driver">Driver/Courier</SelectItem>
              <SelectItem value="user">User/Customer</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-600">{errors.role.message}</p>
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
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden bg-white">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Icon name="UserPlus" size={24} />
            Create New User Account
          </DialogTitle>
          <DialogDescription>
            Add a new user to the Parcego platform. Fill out all required information to create their account.
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
                <span>Creating user account...</span>
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
              {isSubmitting ? "Creating Account..." : `Create ${watch('role') === 'driver' ? 'Courier' : watch('role') === 'admin' ? 'Admin' : 'User'} Account`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourierCreationModal;
