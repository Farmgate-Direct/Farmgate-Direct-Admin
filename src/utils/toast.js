import { sileo } from "sileo";

export const toastSuccess = (title, description = "") =>
  sileo.success({
    title,
    description,
    fill: "#15803d",
    styles: {
      title: "text-white!",
      description: "text-white!",
      badge: "bg-white! text-[#15803d]!",
    },
  });

export const toastError = (title, description = "") =>
  sileo.error({
    title,
    description,
    fill: "#DC2626",
    styles: {
      title: "text-white!",
      description: "text-white!",
      badge: "bg-white! text-[#DC2626]!",
    },
  });
