import React from "react";

export default function Button({
  children,
  variant = "default", // default | primary | ghost | danger
  size = "md", // md | sm | icon
  className = "",
  ...rest
}) {
  const classes = ["btn"];
  if (variant === "primary") classes.push("btn-primary");
  if (variant === "ghost") classes.push("btn-ghost");
  if (variant === "danger") classes.push("btn-danger");
  if (size === "sm") classes.push("btn-sm");
  if (size === "icon") classes.push("btn-icon");
  if (className) classes.push(className);

  return (
    <button className={classes.join(" ")} {...rest}>
      {children}
    </button>
  );
}
