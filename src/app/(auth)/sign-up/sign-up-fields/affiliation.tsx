// components
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { handleYearInput } from "@/validation/auth/sign-up-form-schema";

export const Affiliation = ({ index, form }: { index: number; form: any }) => {
  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-3 bg-gray-200 rounded-xl py-5 p-4">
      {/* affiliation name */}
      <div className="col-span-7">
        <FormField
          control={form.control}
          name={`affiliation.${index}.affiliationName`}
          render={({ field }) => (
            <FormItem className="gap-0">
              <FormLabel className="text-xs font-light">
                Affiliation Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Society of X"
                  {...field}
                  className="bg-white border border-gray-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* year joined */}
      <div className="col-span-5">
        <FormField
          control={form.control}
          name={`affiliation.${index}.yearJoined`}
          render={({ field }) => (
            <FormItem className="gap-0">
              <FormLabel className="text-xs font-light">Year Joined</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1980}
                  onKeyDown={handleYearInput}
                  placeholder="2024"
                  {...field}
                  className="bg-white border border-gray-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="col-span-12">
        {/* university */}
        <FormField
          control={form.control}
          name={`affiliation.${index}.university`}
          render={({ field }) => (
            <FormItem className="gap-0">
              <FormLabel className="text-xs font-light">University</FormLabel>
              <FormControl>
                <Input
                  placeholder="University of the Philippines"
                  {...field}
                  className="bg-white border border-gray-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
