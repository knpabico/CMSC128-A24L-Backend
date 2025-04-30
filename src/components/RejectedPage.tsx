import { BadgeXIcon } from "lucide-react";
import { useState } from 'react';

const RejectedPage = () => {
  const [isChecked, setIsChecked] = useState(false);

  // idk pano madedelete yung account pag cinlick yung checkbox, kaya kayo na bahala dito hehe
  const handleChange = (event) => {
    setIsChecked(event.target.checked);
  };

  return <div>
    <div className="flex flex-col justify-center items-center h-screen w-screen bg-white space-y-10">
      <BadgeXIcon className="text-red-500 w-25 h-25"/>
      <p className="text-5xl font-bold">Your account has been rejected.</p>
      <div className="flex flex-col justify-center items-center">
        <p>This may be due to incomplete or incorrect information, failure to meet eligibility requirements, or other validation issues.</p>
        <p>If you wish to reuse your email address to create a new account, please tick the checkbox below.</p>
      </div>
      
      <div className="flex space-x-3 justify-center items-center">
        <input type="checkbox" checked={isChecked} onChange={handleChange} className="appearance-none h-4 w-4 border-2 border-[#0856ba] rounded-xs checked:appearance-auto focus:outline-none cursor-pointer"/>
        <p className="text-[#0856ba]">I want to reuse my email address for a new account.</p>
      </div>

      {/* dapat dito lang madedelete yung account; dapat din babalik to sa landing page */}
      <button className="w-50 text-sm col-span-6 bg-[#0856ba] text-white p-2 rounded-full cursor-pointer hover:bg-[#92b2dc]">Exit</button>
      
    </div>
  </div>;
};

export default RejectedPage;
