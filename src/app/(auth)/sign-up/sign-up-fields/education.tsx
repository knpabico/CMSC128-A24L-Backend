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
  masters: "Masters",
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
    <div className="grid grid-cols-12 gap-4">
      {/* degree program */}
      <div className="col-span-7">
        <FormField
          control={form.control}
          name={`${type}.${index}.major`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{types[type]} Degree*</FormLabel>
              <FormControl>
                <Input placeholder="Degree Program" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* year graduated */}
      <div className="col-span-5 mt-5">
        <FormField
          control={form.control}
          name={`${type}.${index}.yearGraduated`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Year Graduated" {...field} />
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
            <FormItem>
              <FormControl>
                <Input placeholder="University" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
