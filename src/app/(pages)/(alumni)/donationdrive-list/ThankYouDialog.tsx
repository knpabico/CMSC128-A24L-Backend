import { Button } from "@/components/ui/button";
import {
Dialog,
DialogContent,
DialogDescription,
DialogFooter,
DialogHeader,
DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { CircleCheck, BadgeCheck } from 'lucide-react';

export function ThankYouDialog() {
	const [isThankYouOpen, setIsThankYouOpen] = useState(true);
	return (
		<Dialog open={isThankYouOpen} onOpenChange={setIsThankYouOpen}>
			<DialogContent className="max-w-[400px] p-8 flex flex-col justify-center">
				<DialogHeader className="flex flex-col justify-center items-center">
					<CircleCheck className="size-20 text-green-700" />
					<DialogTitle className="text-2xl">Thank You!</DialogTitle>
					<DialogDescription className="text-sm mt-2 text-center">
						Like an open-source project, your generosity makes everything better! Thank you for contributing to something bigger than yourself. 
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="mt-6">
					<Button className="text-sm text-[#0856BA] w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] border-2 hover:bg-gray-100" onClick={() => setIsThankYouOpen(false)} >
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
