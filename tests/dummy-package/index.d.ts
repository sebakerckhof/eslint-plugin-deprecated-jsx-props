/// <reference types="react" />
interface ComponentWithInterfaceProps {
  /** @deprecated reason */
  someProp?: string;
  /** @deprecated reason2 */
  someProp2?: string;
  someOtherProp: number;
}
type ComponentWithTypeProps = {
  /** @deprecated reason */
  someProp?: string;
  /** @deprecated reason2 */
  someProp2?: string;
  someOtherProp: number;
};
declare const ComponentWithInterface: ({ someProp, someOtherProp, someProp2 }: ComponentWithInterfaceProps) => import("react").JSX.Element;
declare const ComponentWithType: ({ someProp, someOtherProp, someProp2 }: ComponentWithTypeProps) => import("react").JSX.Element;
export { ComponentWithType, ComponentWithInterface, };
