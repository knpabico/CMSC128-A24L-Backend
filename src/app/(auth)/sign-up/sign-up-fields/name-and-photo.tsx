// components
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export const NameAndPhoto = ({ form }: { form: any }) => {
  return (
    <div className="space-y-2">
      {/* name form fields */}
      <p className="text-sm font-semibold">Full Name</p>
      <div className="grid grid-cols-12 gap-x-4 gap-y-3">
        {/* first name form field */}
        <div className="col-span-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="gap-0">
                <FormLabel className="text-xs font-light">
                  First Name*
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Juan"
                    type="text"
                    {...field}
                    className=" bg-white border border-gray-500"
                  />
                </FormControl>
                {/* FormMessage is used for displaying validation error message */}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* middle name form field */}
        <div className="col-span-6">
          <FormField
            control={form.control}
            name="middleName"
            render={({ field }) => (
              <FormItem className="gap-0">
                <FormLabel className="text-xs font-light">
                  Middle Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Martinez"
                    type="text"
                    {...field}
                    className="bg-white border border-gray-500"
                  />
                </FormControl>
                {/* FormMessage is used for displaying validation error message */}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* last name form field */}
        <div className="col-span-6">
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="gap-0">
                <FormLabel className="text-xs font-light">Last Name*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Dela Cruz"
                    type="text"
                    {...field}
                    className="bg-white border border-gray-500"
                  />
                </FormControl>
                {/* FormMessage is used for displaying validation error message */}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* last name form field */}
        <div className="col-span-6">
          <FormField
            control={form.control}
            name="suffix"
            render={({ field }) => (
              <FormItem className="gap-0">
                <FormLabel className="text-xs font-light">Suffix</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jr."
                    type="text"
                    {...field}
                    className="bg-white border border-gray-500"
                  />
                </FormControl>
                {/* FormMessage is used for displaying validation error message */}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
