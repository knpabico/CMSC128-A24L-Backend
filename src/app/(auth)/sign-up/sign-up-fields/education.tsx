// components
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const types = {
  bachelors: "Bachelor's",
  masters: "Master's",
  doctoral: "Doctoral",
};

export const Education = ({
  index,
  form,
  type,
}: {
  index: number;
  form: any;
  type: "bachelors" | "doctoral" | "masters";
}) => {
  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-3 bg-gray-200 rounded-xl py-5 p-4">
      {/* degree program */}
      <div className="col-span-7">
        <FormField
          control={form.control}
          name={`${type}.${index}.major`}
          render={({ field }) => (
            <FormItem className="gap-0">
              <FormLabel className="text-xs font-light">Degree Program</FormLabel>
              <FormControl>
                <Input placeholder="BS Computer Science" {...field} className="bg-white border border-gray-500"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* year graduated */}
      <div className="col-span-5">
        <FormField
          control={form.control}
          name={`${type}.${index}.yearGraduated`}
          render={({ field }) => (
            <FormItem className="gap-0">
              <FormLabel className="text-xs font-light">Year Graduated</FormLabel>
              <FormControl>
                <Input placeholder="2024" {...field} className="bg-white border border-gray-500"/>
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
          name={`${type}.${index}.university`}
          render={({ field }) => (
            <FormItem className="gap-0">
              <FormLabel className="text-xs font-light">University</FormLabel>
              <FormControl>
                <Input placeholder="University of the Philippines" {...field} className="bg-white border border-gray-500"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
