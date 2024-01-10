import React from 'react';
import { deprecate } from 'util';

type TComponentProps = {
  /**
   * @deprecated reason
   * More elaborate description...
   * */
  someProp?: string;

  /** @deprecated reason2 */
  someProp2?: string;

  /** @deprecated reason3 */
  someProp3?: string;

  someProp4?: string;
}


// Local component definition and usage
type ComponentProps = Pick<TComponentProps, 'someProp' | 'someProp2'> & {
  /** @deprecated reason3 */
  someProp3?: string;

  /** @deprecated reason4 */
  someProp4?: boolean;

  someOtherProp: number;
}


type TComponentPropsAlt = Partial<ComponentProps>;
const Component = ({ someProp, someOtherProp, someProp2, someProp4, someProp3 }: TComponentPropsAlt) => {
  return (
    <div>
      {someProp}
      {someOtherProp}
      {someProp2}
      {someProp3}
      {someProp4}
    </div>
  );
};

export const Test = () => {
  const props1: Partial<ComponentProps> = {
    someProp: '',
    someOtherProp: 1,
  };

  const prop3 = {
    someProp2: '',
  }

  const props2: ComponentProps = {
    ...prop3,
    someOtherProp: 1,
  };
  props2.someProp4 = true;

  return (
    <React.Fragment>
      <Component {...props2} {...props1} someProp4 />
    </React.Fragment>
  );
};
