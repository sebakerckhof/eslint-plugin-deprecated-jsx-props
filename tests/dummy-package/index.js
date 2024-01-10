"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentWithInterface = exports.ComponentWithType = void 0;
const ComponentWithInterface = ({ someProp, someOtherProp, someProp2 }) => {
    return (React.createElement("div", null,
        someProp,
        someOtherProp,
        someProp2));
};
exports.ComponentWithInterface = ComponentWithInterface;
const ComponentWithType = ({ someProp, someOtherProp, someProp2 }) => {
    return (React.createElement("div", null,
        someProp,
        someOtherProp,
        someProp2));
};
exports.ComponentWithType = ComponentWithType;
