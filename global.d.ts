import type React from "react";

type WebComponentProps = React.HTMLAttributes<HTMLElement> & {
  class?: string;
  anchor?: string;
  popover?: boolean | string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "el-dropdown": WebComponentProps;
      "el-menu": WebComponentProps;
      "el-disclosure": WebComponentProps;
    }
  }
}

export {};
