import clsx from "clsx";
import { FC } from "react";
import styles from "./loading-spinner.module.scss";

const LoadingSpinner: FC<{ color?: string }> = ({ color }) => {
  return (
    <div className={clsx("flex flex-col items-center justify-center", styles["loading-button-overlay"])}>
      <div className={clsx("flex flex-col items-center justify-center", styles["loading-main-button"])} style={color ? {
        borderTopColor: color
      } : {}} />
    </div>
  )
}

export default LoadingSpinner;
