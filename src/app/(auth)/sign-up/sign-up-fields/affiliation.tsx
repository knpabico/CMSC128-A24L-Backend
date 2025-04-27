// components
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export const Affiliation = ({ index, form }: { index: number; form: any }) => {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* affiliation name */}
      <div className="col-span-7">
        <FormField
          control={form.control}
          name={`affiliation.${index}.affiliationName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Affiliation</FormLabel>
              <FormControl>
                <Input placeholder="Affiliation Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* year joined */}
      <div className="col-span-5 mt-5">
        <FormField
          control={form.control}
          name={`affiliation.${index}.yearJoined`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Year Joined" {...field} />
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
