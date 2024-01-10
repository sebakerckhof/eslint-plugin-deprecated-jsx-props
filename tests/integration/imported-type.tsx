import { ComponentProps } from './imported-type.types';
import React from 'react';

const Component = ({ someProp, someOtherProp, someProp2 }: ComponentProps) => {
  return (
    <div>
      {someProp}
      {someOtherProp}
      {someProp2}
    </div>
  );
};

export const Test = () => {
  return (
    <React.Fragment>
      <Component someProp="" someProp2="" someOtherProp={1} />
    </React.Fragment>
  );
};
