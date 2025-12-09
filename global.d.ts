import type React from "react";

type WebComponentProps = Omit<React.HTMLAttributes<HTMLElement>, "popover"> & {
  class?: string;
  anchor?: string;
  popover?: boolean | "" | "auto" | "manual" | "hint";
};

declare module "react" {
  interface ButtonHTMLAttributes<T> {
    command?: string;
    commandfor?: string;
  }
}

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "el-dropdown": WebComponentProps;
        "el-menu": WebComponentProps;
        "el-disclosure": WebComponentProps;
      }
    }
  }
}

export {};
