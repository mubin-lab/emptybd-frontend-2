"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";

interface TutorialModalsProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onFirstClose: () => void;
}

export default function TutorialModals({ isOpen, setIsOpen, onFirstClose }: TutorialModalsProps) {
  // modalStep: 1 = platform tutorial, 2 = email/gmail tutorial
  const [modalStep, setModalStep] = useState<1 | 2>(1);

  // If the parent says we're open, but we just want to reset step
  useEffect(() => {
    if (isOpen) {
      setModalStep(1);
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (modalStep === 1) {
        // Closed the first modal
        onFirstClose();
        setIsOpen(false);
      } else if (modalStep === 2) {
        // Closed the second modal, return to first
        setModalStep(1);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl p-3 md:p-8 bg-gray-950 border border-gray-900 rounded-xl overflow-y-auto max-h-[90vh]">
        {modalStep === 1 ? (
          <>
            <DialogHeader className="mb-0">
              <DialogTitle className="text-xl hidden md:text-2xl text-center text-white font-parkinsans font-bold">
                Welcome to Our Platform!
              </DialogTitle>
              <div className="mt-4 p-4 bg-gray-900/50 border border-gray-800 rounded-lg text-center flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-gray-300 font-medium font-hind text-sm md:text-base">
                  কিভাবে Gmail অ্যাকাউন্ট খুলবেন?
                </span>
                <Button 
                  onClick={() => setModalStep(2)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors w-full sm:w-auto"
                >
                  দেখুন কিভাবে খুলবেন
                </Button>
              </div>
            </DialogHeader>
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-800 shadow-xl bg-black">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/Ha5Vpa-ppJc?si=rtvosf3iAQTjzd73" 
                title="Platform Tutorial Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
              ></iframe>
            </div> 
          </>
        ) : (
          <>
            <DialogHeader className="">
              <DialogTitle className="text-xl hidden md:text-2xl text-center text-white font-parkinsans font-bold">
                How to Get Started with Email/Gmail
              </DialogTitle> 
            </DialogHeader>
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-800 shadow-xl bg-black">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/Zx2G17hb0Ow?si=diPtYpS_hVb8LMXB" 
                title="Email/Gmail Tutorial Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
              ></iframe>
            </div>
            <div className="flex justify-between items-center">
              <Button 
                variant="ghost" 
                onClick={() => setModalStep(1)}
                className="text-gray-400 hover:text-white"
              >
                ← আগের ভিডিও দেখুন
              </Button> 
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
