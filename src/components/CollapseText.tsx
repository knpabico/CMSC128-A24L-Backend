import React, { useState } from 'react';

type Props = {
  text: string;
  maxChars: number;
};

const CollapseText: React.FC<Props> = ({ text, maxChars}) => {
  const [collapsed, setCollapsed] = useState(false);

  const isLongText = text.length > maxChars;
  const displayText = collapsed || !isLongText ? text : text.slice(0, maxChars) + ' ...';

  return (
    <div className="flex flex-row flex-wrap">
      <p className='text-justify text-[15px] whitespace-pre-wrap'>{displayText}
      {isLongText && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:underline focus:outline-none"
        >
          {collapsed ? 'See less' : 'See more'}
        </button>
      )}</p>
    </div>
  );
};

export default CollapseText;
