import { termsData } from "@/data/terms-data";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TermsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="underline hover:text-blue-500 font-bold">
          terms and conditions
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
          <DialogDescription>
            <p className="text-base text-gray-700">
              By registering for an account on <strong>ICS-ARMS</strong>, you
              agree to the following terms and conditions:
            </p>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-96 rounded-md border overflow-auto p-4">
          {termsData.map((term, index) => (
            <div key={index} className="mb-5">
              <h2 className="text-xl font-semibold text-gray-800 mb-1">
                {term.title}
              </h2>
              <p className="text-base text-gray-700">{term.content}</p>
            </div>
          ))}
        </ScrollArea>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
