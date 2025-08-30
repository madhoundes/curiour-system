"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

interface BaseProps {
  children: React.ReactNode
}

interface RootLabelSuccessModalProps extends BaseProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface LabelSuccessModalProps extends BaseProps {
  className?: string
  asChild?: true
}

const LabelSuccessModalContext = React.createContext<{ isMobile: boolean }>({
  isMobile: false,
})

const useLabelSuccessModalContext = () => {
  const context = React.useContext(LabelSuccessModalContext)
  if (!context) {
    throw new Error(
      "LabelSuccessModal components cannot be rendered outside the LabelSuccessModal Context"
    )
  }
  return context
}

const LabelSuccessModal = ({ children, ...props }: RootLabelSuccessModalProps) => {
  const isMobile = useIsMobile()
  const Modal = isMobile ? Drawer : Dialog

  return (
    <LabelSuccessModalContext.Provider value={{ isMobile }}>
      <Modal {...props} {...(isMobile && { autoFocus: true })}>
        {children}
      </Modal>
    </LabelSuccessModalContext.Provider>
  )
}

const LabelSuccessModalClose = ({ className, children, ...props }: LabelSuccessModalProps) => {
  const { isMobile } = useLabelSuccessModalContext()
  const ModalClose = isMobile ? DrawerClose : DialogClose

  return (
    <ModalClose className={className} {...props}>
      {children}
    </ModalClose>
  )
}

const LabelSuccessModalContent = ({ className, children, ...props }: LabelSuccessModalProps) => {
  const { isMobile } = useLabelSuccessModalContext()
  const ModalContent = isMobile ? DrawerContent : DialogContent

  return (
    <ModalContent 
      className={cn(
        // Medium width as requested
        !isMobile && "max-w-2xl w-full",
        className
      )} 
      {...props}
      // Disable auto-close button for custom close handling
      showCloseButton={false}
    >
      {children}
    </ModalContent>
  )
}

const LabelSuccessModalDescription = ({
  className,
  children,
  ...props
}: LabelSuccessModalProps) => {
  const { isMobile } = useLabelSuccessModalContext()
  const ModalDescription = isMobile ? DrawerDescription : DialogDescription

  return (
    <ModalDescription className={className} {...props}>
      {children}
    </ModalDescription>
  )
}

const LabelSuccessModalHeader = ({ className, children, ...props }: LabelSuccessModalProps) => {
  const { isMobile } = useLabelSuccessModalContext()
  const ModalHeader = isMobile ? DrawerHeader : DialogHeader

  return (
    <ModalHeader className={className} {...props}>
      {children}
    </ModalHeader>
  )
}

const LabelSuccessModalTitle = ({ className, children, ...props }: LabelSuccessModalProps) => {
  const { isMobile } = useLabelSuccessModalContext()
  const ModalTitle = isMobile ? DrawerTitle : DialogTitle

  return (
    <ModalTitle className={className} {...props}>
      {children}
    </ModalTitle>
  )
}

const LabelSuccessModalBody = ({ className, children, ...props }: LabelSuccessModalProps) => {
  return (
    <div className={cn("px-3 md:px-4", className)} {...props}>
      {children}
    </div>
  )
}

const LabelSuccessModalFooter = ({ className, children, ...props }: LabelSuccessModalProps) => {
  const { isMobile } = useLabelSuccessModalContext()
  const ModalFooter = isMobile ? DrawerFooter : DialogFooter

  return (
    <ModalFooter className={className} {...props}>
      {children}
    </ModalFooter>
  )
}

export {
  LabelSuccessModal,
  LabelSuccessModalBody,
  LabelSuccessModalClose,
  LabelSuccessModalContent,
  LabelSuccessModalDescription,
  LabelSuccessModalFooter,
  LabelSuccessModalHeader,
  LabelSuccessModalTitle,
}


