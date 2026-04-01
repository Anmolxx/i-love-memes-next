"use client";

import * as React from "react";
import { useTransition } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type ConfirmationVariant = "destructive" | "default" | "secondary" | "primary";

interface ConfirmationDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  showTrigger?: boolean;
  onSuccess?: () => void;
  deleteDescription?: string;
  deleteTitle?: string;
  action: () => Promise<any>;
  confirmButtonText?: string;
  variant?: ConfirmationVariant;
}

export function ConfirmationDialog({
  showTrigger = true,
  onSuccess,
  action,
  deleteTitle = "Are you absolutely sure?",
  deleteDescription = "This action cannot be undone. This will permanently delete this item from our servers.",
  confirmButtonText = "Confirm",
  variant = "destructive",
  ...props
}: ConfirmationDialogProps) {
  const [isActionPending, startActionTransition] = useTransition();
  const isDesktop = useMediaQuery("(min-width: 640px)");

  function onConfirmAction() {
    startActionTransition(async () => {
      await action();
      props.onOpenChange?.(false);
      onSuccess?.();
    });
  }

  if (isDesktop) {
    return (
      <Dialog {...props}>
        {showTrigger ? (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Trigger Action
            </Button>
          </DialogTrigger>
        ) : null}
        <DialogContent className="gap-4">
          <DialogHeader className="gap-4">
            <DialogTitle className="text-center">{deleteTitle}</DialogTitle>
            <DialogDescription className="text-center">
              {deleteDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:space-x-0">
            <DialogClose asChild className="w-1/2">
              <Button variant="outline">No, Cancel</Button>
            </DialogClose>
            <Button
              aria-label={`Confirm ${confirmButtonText}`}
              variant={variant as "destructive"}
              onClick={onConfirmAction}
              disabled={isActionPending}
              className="w-1/2 cursor-pointer"
            >
              {confirmButtonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer {...props}>
      {showTrigger ? (
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm">
            Trigger Action
          </Button>
        </DrawerTrigger>
      ) : null}
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{deleteTitle}</DrawerTitle>
          <DrawerDescription>{deleteDescription}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="gap-2 sm:space-x-0">
          <DrawerClose asChild>
            <Button variant="outline">No, Cancel</Button>
          </DrawerClose>
          <Button
            aria-label={`Confirm ${confirmButtonText}`}
            variant={variant as "destructive"}
            onClick={onConfirmAction}
            disabled={isActionPending}
          >
            {confirmButtonText}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
