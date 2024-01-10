import React from 'react';

export type ExternalComponentProps = {
  /** @deprecated */
  deprecatedProp?: string;

  /**
   * A prop
   * @private
   */
  acceptedProp: string;
}

// Local component definition and usage
type ComponentProps = ExternalComponentProps & {
  someOtherProp: number;
}

const Component = ({ someOtherProp, deprecatedProp, acceptedProp }: ComponentProps) => {
  return (
    <div>
      {deprecatedProp}
      {acceptedProp}
      {someOtherProp}
    </div>
  );
};

export const Test = () => {
  return (
    <React.Fragment>
      <Component deprecatedProp="" acceptedProp="" someOtherProp={1} />
    </React.Fragment>
  );
};
