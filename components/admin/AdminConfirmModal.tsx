"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, CheckCircle, Info, HelpCircle } from "lucide-react";
import { SpinnerCustom } from "@/components/loading/Spinner";

interface AdminConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: "default" | "danger" | "warning" | "success";
}

export default function AdminConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  type = "default",
}: AdminConfirmModalProps) {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />;
      case "warning":
        return <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto" />;
      case "success":
        return <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />;
      default:
        return <Info className="h-10 w-10 text-blue-500 mx-auto" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white font-parkinsans";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 text-white font-parkinsans";
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white font-parkinsans";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white font-parkinsans";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-6 bg-gray-900 border border-gray-850">
        <DialogHeader className="text-center pt-2">
          <div className="mb-4">{getIcon()}</div>
          <DialogTitle className="text-xl font-bold font-parkinsans text-white text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400 text-center mt-2 leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2 gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 font-parkinsans"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full ${getConfirmButtonClass()}`}
          >
            {isLoading ? <SpinnerCustom /> : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
