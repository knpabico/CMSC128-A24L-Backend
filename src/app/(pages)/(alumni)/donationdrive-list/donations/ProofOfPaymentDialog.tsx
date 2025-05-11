import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

export function ProofOfPaymentDialog({
  selectedImage,
  setSelectedImage,
}: {
  selectedImage: string;
  setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  return (
    <Dialog
      open={!!selectedImage}
      onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}
    >
      <DialogContent className="w-fit p-4 text-center">
        <DialogHeader>
          <DialogTitle>Proof of Payment</DialogTitle>
        </DialogHeader>
        {selectedImage && (
          <div className="mt-3">
            <Image
              width={0}
              height={0}
              sizes="100vw"
              priority
              src={selectedImage}
              alt="Payment Proof"
              className="w-auto h-100"
            />
          </div>
        )}
        <DialogFooter className="mt-3">
          <Button
            className="text-sm text-white w-full px-1 py-[5px] rounded-3 font-semibold text-center flex justify-center border-[#0856BA] border-2 bg-[#0856BA]"
            onClick={() => setSelectedImage(null)} // Close the dialog by resetting the image
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
