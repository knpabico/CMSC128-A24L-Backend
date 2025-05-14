import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PdfPreviewDialog({
  selectedFile,
  setSelectedFile,
}: {
  selectedFile: string;
  setSelectedFile: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  return (
    <Dialog open={!!selectedFile} onOpenChange={(isOpen) => !isOpen && setSelectedFile(null)}>
      <DialogContent className="w-fit p-4 text-center max-h-[98dvh] mt-[0.3dvh]">
        <DialogHeader>
          <DialogTitle>PDF Preview</DialogTitle>
        </DialogHeader>
        {selectedFile && (
          <div className="mt-2">
            <embed src={selectedFile} className="w-150 h-130" />
          </div>
        )}
        <DialogFooter className="mt-2">
          <Button
            className="text-sm text-white w-full px-1 py-[5px] rounded-3 font-semibold text-center flex justify-center border-[#0856BA] border-2 bg-[#0856BA]"
            onClick={() => setSelectedFile(null)} // Close the dialog by resetting the image
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
