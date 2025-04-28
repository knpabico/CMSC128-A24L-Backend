// components
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlumPhotoUpload } from "./alum_photo";

export const NameAndPhoto = ({ form }: { form: any }) => {
  return (
    <div>
      {/* name form fields */}
      <div className="grid grid-cols-12 gap-4">
        {/* first name form field */}
        <div className="col-span-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Juan" type="text" {...field} />
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
              <FormItem>
                <FormLabel>Middle Name</FormLabel>
                <FormControl>
                  <Input placeholder="Martinez" type="text" {...field} />
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
              <FormItem>
                <FormLabel>Last Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Dela Cruz" type="text" {...field} />
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
              <FormItem>
                <FormLabel>Suffix</FormLabel>
                <FormControl>
                  <Input placeholder="Jr." type="text" {...field} />
                </FormControl>
                {/* FormMessage is used for displaying validation error message */}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/*alum photo */}
        <div>
          <AlumPhotoUpload form={form}></AlumPhotoUpload>
        </div>
      </div>
    </div>
  );
};
