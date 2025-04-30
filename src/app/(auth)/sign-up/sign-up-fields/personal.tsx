"use client";

// components
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export const Personal = ({ form }: { form: any }) => {
  return (
    <div className="space-y-7">

      <div className="grid grid-cols-12 gap-x-4 gap-y-3">
        {/* birthDate form field */}
        <div className="col-span-6">
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem className="gap-0">
                <p className="text-sm font-semibold">Birthday*</p>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    // we will not provide a default value to this input field
                    // that requires a number value when we create the react hook form (the form variable above)
                    // Instead, if the value of it is undefined initially, then we set
                    // it to an empty string here
                    value={field.value ?? ""}
                    className="bg-white border border-gray-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* address form field */}
      <div className="space-y-2">
        <p className="text-sm font-semibold">Current Home Address</p>
        <div className="grid grid-cols-12 gap-x-4 gap-y-3">
          {/* country */}
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="address.0"
              render={({ field }) => (
                <FormItem className="gap-0">
                  <FormLabel className="text-xs font-light">Country*</FormLabel>
                  <FormControl>
                    <Input placeholder="Philippines" {...field} className="bg-white border border-gray-500"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="col-span-6">
            {/* province/state */}
            <FormField
              control={form.control}
              name="address.2"
              render={({ field }) => (
                <FormItem className="gap-0">
                  <FormLabel className="text-xs font-light">Province/State*</FormLabel>
                  <FormControl>
                    <Input placeholder="Laguna" {...field} className="bg-white border border-gray-500"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* city/municipality */}
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="address.1"
              render={({ field }) => (
                <FormItem className="gap-0">
                  <FormLabel className="text-xs font-light">City/Municipality*</FormLabel>
                  <FormControl>
                    <Input placeholder="Los Baños" {...field} className="bg-white border border-gray-500"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>  
      
    </div>
  );
};
