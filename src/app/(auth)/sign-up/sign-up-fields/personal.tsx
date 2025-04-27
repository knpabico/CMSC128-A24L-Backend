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
    <div>
      {/* birthDate form field */}
      <div className="col-span-6">
        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birthday*</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  // we will not provide a default value to this input field
                  // that requires a number value when we create the react hook form (the form variable above)
                  // Instead, if the value of it is undefined initially, then we set
                  // it to an empty string here
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* address form field */}

      <div className="grid grid-cols-12 gap-4">
        {/* country */}
        <div className="col-span-6">
          <FormField
            control={form.control}
            name="address.0"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Home Address*</FormLabel>
                <FormControl>
                  <Input placeholder="Country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* city/municipality */}
        <div className="col-span-6 mt-5">
          <FormField
            control={form.control}
            name="address.1"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="City/Municipality" {...field} />
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
              <FormItem>
                <FormControl>
                  <Input placeholder="Province/State" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
